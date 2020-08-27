---
title: Architect Serverless framework
date: 2020-8-27
icon: /favicon.ico
css: /global.css
description: Architect is an open-source serverless framework 
image_url: /hyper63-og.png
image_alt: hyper63 a different approach to software
---

# Intro to Architect Serverless framework

[Architect](https://arc.codes) is a serverless framework specifically for AWS. Architect is a lightweight and low code framework for creating and managing serverless functions within the AWS ecosystem. 

## Deploying a web service:

``` sh
npm install -g @architect/architect
mkdir my-project
cd my-project
arc init my-project
```

edit `src/http/get-index/index.js`

```
exports.handler = async function (request) {
  return {
    headers: { 'content-type': 'text/html; charset=utf-8;'},
    body: '<h1>Hello World!</h1>'
  }
}
```

``` sh
arc sandbox
```

```
open http://localhost:3333
```

You should see your hello world page from the serverless function.

To deploy: `arc deploy` will push up to your AWS infrastructure and create an AWS gateway endpoint mapped to your AWS lambda function.

Architect takes care of all the heavy infrastructure lifting of the AWS ecosystem and gives you a declarative specification file that you manage. It is called a `.arc` file, in this example, you can view your `app.arc` file created in your `my-project` directory.

``` 
@app
my-project

@http
get /
```

This example is just an introduction to Architect; you can create complex serverless systems with Architects declarative file and a collection of serverless functions.

Architect currently supports the following:

* http functions
* websocket functions
* static assets/sites
* CDNs - content delivery networks
* scheduled functions - cron jobs
* event functions - publish/subscribe
* queue functions - subscribe to FIFO queue
* data - access nosql store for data
* macros - extend your cloudformation at deploy time

These are rich, well-defined abstractions to AWS's world-class infrastructure services. Using this kind of generalization can keep your business logic loosely coupled but give you a connected developer environment without managing several moving parts. The arc `cli` supports the ability to ship to both a staging and production environment and the ability to destroy the currently provisioned infrastructure. Having the capability to drive your infrastructure via code gives you a full software dev lifecycle to your serverless system.

## Why serverless?

Here are some reasons to go with a serverless architecture, immutable infrastructure that pushes state to the boundaries, cost, and scalability.

## Why use the architect framework?

When working with serverless, it can quickly get complicated as you start to implement multiple workstreams, and you will want to focus on delivering business value, not the underneath plumbing of the infrastructure. Architect gives you a minimum viable abstraction layer that is extendable. 

The Architect is a product of the OpenJS Foundation. 

## Ok, I am interested whats next?

Check out https://arc.codes for more documentation, also join the [slack community](https://join.slack.com/t/architecture-as-text/shared_invite/MjE2MzU4Nzg0NTY1LTE1MDA2NzgyMzYtODE2NzRkOGRmYw)
