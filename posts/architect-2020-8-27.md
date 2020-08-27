---
title: Intro to Architect Serverless framework
date: 2020-8-27
icon: /favicon.ico
css: /global.css
description: Architect is an open-source serverless framework 
image_url: /hyper63-og.png
image_alt: hyper63 a different approach to software
---


<header>
  <img alt="logo" src="/hyper63-icon.svg" />
  <br />
  <a href="/">
    <h1>hyper63</h1>
  </a>
  <h1>A <u>different</u> approach to software</h1>
</header>

<main>

![Architect Logo](architect-logo-500b@2x.png)

# Intro to Architect Serverless framework

__[Architect](https://arc.codes)__ is a serverless framework specifically for AWS. Architect is a lightweight and low code framework for creating and managing serverless functions within the AWS ecosystem. 

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

</main>
<footer style="display: flex;flex-direction: column;align-items:center">
  <p>Subscribe to receive updates</p>

  <style>
    .gumroad-follow-form-embed {
      zoom: 1;
    }

    .gumroad-follow-form-embed:before,
    .gumroad-follow-form-embed:after {
      display: table;
      line-height: 0;
      content: "";
    }

    .gumroad-follow-form-embed:after {
      clear: both;
    }

    .gumroad-follow-form-embed * {
      margin: 0;
      border: 0;
      padding: 0;
      outline: 0;
      box-sizing: border-box !important;
      float: left !important;
    }

    .gumroad-follow-form-embed input {
      border-radius: 4px;
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
      font-family: -apple-system, ".SFNSDisplay-Regular", "Helvetica Neue", Helvetica, Arial, sans-serif;
      font-size: 15px;
      line-height: 20px;
      background: #fff;
      border: 1px solid #ddd;
      border-right: 0;
      color: #aaa;
      padding: 10px;
      box-shadow: inset 0 1px 0 rgba(0, 0, 0, 0.02);
      background-position: top right;
      background-repeat: no-repeat;
      text-rendering: optimizeLegibility;
      font-smoothing: antialiased;
      -webkit-appearance: none;
      -moz-appearance: caret;
      width: 65% !important;
      height: 40px !important;
    }

    .gumroad-follow-form-embed button {
      border-radius: 4px;
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
      box-shadow: 0 1px 1px rgba(0, 0, 0, 0.12);
      -webkit-transition: all .05s ease-in-out;
      transition: all .05s ease-in-out;
      display: inline-block;
      padding: 11px 15px 12px;
      cursor: pointer;
      color: #fff;
      font-size: 15px;
      line-height: 100%;
      font-family: -apple-system, ".SFNSDisplay-Regular", "Helvetica Neue", Helvetica, Arial, sans-serif;
      background: #36a9ae;
      border: 1px solid #31989d;
      filter: "progid:DXImageTransform.Microsoft.gradient(startColorstr=#5ccfd4, endColorstr=#329ca1, GradientType=0)";
      background: -webkit-linear-gradient(#5ccfd4, #329ca1);
      background: linear-gradient(to bottom, #5ccfd4, #329ca1);
      height: 40px !important;
      width: 35% !important;
    }
  </style>
  <form action="https://gumroad.com/follow_from_embed_form" class="form gumroad-follow-form-embed"
    method="post"> <input name="seller_id" type="hidden" value="6457209038237"> <input name="email" placeholder="Your email address" type="email">
    <button data-custom-highlight-color="" type="submit">Follow</button> </form>
  <p>or follow us on twitter</p>
  <a href="https://twitter.com/hyper632?ref_src=twsrc%5Etfw" class="twitter-follow-button"
    data-show-count="false">Follow @hyper632</a>
  <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
</footer>
