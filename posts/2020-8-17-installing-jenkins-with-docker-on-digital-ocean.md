---
title: Installing jenkins 2 with docker on digital ocean
date: 2020-8-17
---

# Installing jenkins 2 with docker on digital ocean

This article is a you may need it later article for my future self. At some point in time, you may need to setup a ci server and when that time happens again, I want to be able to go boom, boom, and then bam, a be done. The purpose of this article is to make the steps simple and easy to refer to in the future. It most likely will not be very entertaining or snarky or opinionated. We could have a long conversation, why not use terraform or ansible or use a ci service like circle ci or gitlab ci or github actions. But there will not be much point to have that conversation, if you want to debate those points, twitter is a great spot. 

## Why

The need, I need to be able to run tests, code analysis, security tools against my code on every commit, I can depend on the commits will be coming from a git repository. I can not say it will be github, gitlab, gitea etc, it maybe all of them so I don't want to marry my ci/cd to my sourcecode, I want them to be friends and play nice. I may need to deploy by building a docker image and commiting to a docker repository or just call some api or cli, I need the flexibility to all the above. Finally, I need to be able to store my ci details in code, the only configuration changes is via a code commit. And I want to pay less than $20 bucks a month to run my ci server. So thats it, that is all my reasoning to use jenkins, it is a good general software approach to a general solved problem. 

## Easy to maintain

I also want it to be super easy to upgrade versions of jenkins:

```
docker stop jenkins
docker rm jenkins
docker run --name jenkins -d -p 50000:50000 -p 8080:8080 -v jenkins-data:/var/jenkins_home jenkins/jenkins:lts
```

## Installing on digital ocean

requirements: You need a digital ocean account: 

> Use this link to get $100 credit over 60 days https://m.do.co/c/13f2df3bf0b9

Add ssh key

Once you get your account, get an API access token

https://www.digitalocean.com/docs/apis-clis/api/create-personal-access-token/

Then use this curl command to launch a droplet with docker installed.

> you may want to install jq to parse some json - https://stedolan.github.io/jq/ 

``` sh
curl -X GET -H "Content-Type: application/json" -H "Authorization: Bearer $DO_KEY" "https://api.digitalocean.com/v2/account/keys" | jq '.ssh_keys | .[] | .id, .name'
```

Grab some of the ssh_key ids and add them to your curl POST command

``` sh
SSH_KEYS = [ 1000,2000 ]

curl -X POST -H 'Content-Type: application/json' \
     -H 'Authorization: Bearer '$TOKEN'' -d \
     '{"name":"jenkins","region":"nyc3","size":"s-1vcpu-2gb","image":"docker-18-04", "ssh_keys": $SSH_KEYS }' \
     "https://api.digitalocean.com/v2/droplets"
```

## SSH into your droplet

``` sh
ssh root@IP_ADDRESS
adduser username
usermod -aG sudo username
su - username
mkdir .ssh
touch .ssh/authorized_keys
```

In another terminal get your public rsa key for your current device:

``` sh
cat ~/.ssh/id_rsa.pub | pbcopy
```

Then open an editor in your droplet for the `~/.ssh/authorized_keys` and paste the public key into the authorized_keys file.

> This will allow you to access your droplet using ssh username@ip_address

## Install jenkins via docker

``` sh
ssh username@ip_address
sudo docker run -d -p 8080:8080 -p 50000:50000 -v jenkins-data:/var/jenkins_home --restart unless-stopped --name jenkins jenkins/jenkins:lts
```

get the initial passcode

``` sh
docker exec jenkins-production bash -c 'cat $JENKINS_HOME/secrets/initialAdminPassword'
```

Save this somewhere you can access later.

## Setting up nginx

We will use nginx to proxy to our jenkins server

``` sh
ssh username@ip_addr
sudo apt-get update -y
sudo apt-get install nginx 
```

Using your favorite editor `vim` or `nano` open the default config for nginx

``` sh
sudo vim /etc/nginx/sites-available/jenkins.domain.tld
```

``` 
server {
  listen 80;
  server_name jenkins.domain.tld;

  location / {
    proxy_set_header        Host $host:$server_port;
    proxy_set_header        X-Real-IP $remote_addr;
    proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header        X-Forwarded-Proto $scheme;

    # Fix the "It appears that your reverse proxy set up is broken" error.
    proxy_pass          http://127.0.0.1:8080;
    proxy_read_timeout  90;

    proxy_redirect      http://127.0.0.1:8080 https://jenkins.domain.tld;

    # Required for new HTTP-based CLI
    proxy_http_version 1.1;
    proxy_request_buffering off;
    # workaround for https://issues.jenkins-ci.org/browse/JENKINS-45651
    add_header 'X-SSH-Endpoint' 'jenkins.domain.tld:50022' always;
  }
}

```

``` sh
nginx -t
systemctl restart nginx
```

## Setting up DNS

> Go to your DNS provider and add an A record to the droplet IP address and create jenkins.domain.tld
> If you do not have a domain provider, DNSimple is a great choice - https://dnsimple.com/r/06b74d19913f39
> With DNSimple you can signup to use their api for $5/m or just use their web frontend, I don't 
> modify DNS often, so I use the web frontend.

1. Go to your domain/dns page and click manage.
2. Add an 'A' record with the subdomain 'jenkins' and the ip address of your server.
3. set the TTL to 1 minute

This will register your jenkins.domain.tld url to point to your digital ocean droplet.

## Setting up Lets Encrypt

``` sh
ssh username@jenkins.domain.tld
sudo apt-get update -y
sudo apt-get install certbot python3-certbot-nginx -y
```

Check the nginx configuration file:

```
sudo vim /etc/nginx/sites-available/jenkins.domain.tld
```

Locate the server_name directive and make sure you have the domain name setup correctly.

```
server_name jenkins.domain.tld
```

Setup the firewall to allow for https traffic

```
sudo ufw status
sudo ufw allow 'Nginx FULL'
```

Obtain the SSL/TLS Certificate

```
sudo certbot --nginx -d jenkins.domain.tld
```

Enable automatic certificate renewal

open the crontab configuration file

```
crontab -e
```

add a cron job that runs the certbot command, which renews the certificate, if it detects the cert will expire within 30 days.

```
0 5 * * * /usr/bin/certbot renew --quiet
```

This will run every day at 5 am

## Login to jenkins with inital code and start setting up your jenkins server

```
open https://jenkins.domain.tld
```



