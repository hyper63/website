---
title: hyper63 - a different approach to software
date: 9/4/2020
icon: /favicon.ico
css: /global.css
description: hyper63 is a software company focused on building software products that are scalable and maintainable
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
  <p>Weekly update version 2 - 9/4/2020</p>
</header>

<main style="font-size: 2em;">
In this week's update, we will be sharing more about the company's vision, some exciting workshops, and some information about the first product we will be delivering.

Our mission is to improve software development so that it is scalable and maintainable. (i.e., AntiFragile) Our approach is different from others as it relates to mindset, growth, and flexibility. When designing and creating software, the focus is on the business problem and the technical stack, which are important. Equally important is quality, and to build quality into the product and process, you must consider flexibility and testability as core quality attributes. We want software engineers to be trained with the knowledge to properly consider and address these quality attributes at the point of the design. So that the lifecycle maturity of the product becomes antifragile or future proof.

> a different approach to software

Education plays a significant role in hyper63's mission, and to kick off our education initiatives, we will be providing a free workshop on Svelte. What is Svelte? Svelte is a web framework that compiles. The workshop is on Sept 25, from 12 pm - 3 pm; Take this opportunity to learn a different web application development approach. Register here: https://event.gives/svelte. We will be offering other education offerings monthly.

<a href="https://event.gives/svelte"><img style="width: 100%" alt="svelte workshop banner" src="/svelte-workshop-banner.png" /></a>

Today, we are excited to announce our first product; the project name is Hubble. Hubble will provide a common boundary between your application and the persistence layer. The first version of Hubble will support microservices and small projects.

The initial offering will include the following components:

* data - structured data storage
* cache - fast access temporary data
* files - unstructured data storage
* notifications - real-time event notifications

The Hubble project creates a clear boundary between application business logic and the implementation details. By using Hubble as the backend persistence services for your microservice, you will be able to focus on your business logic without having the concern of leaking business rules into the persistence layer.

The Hubble project will be open source, and you will be able to follow the development and participate in the development here:

<a href="https://github.com/hyper63/hubble"><img style="width: 100%" src="/hubble-banner.png" alt="hubble banner" /></a>

If you have questions or comments about the Hubble project, please post them here:

https://github.com/hyper63/hubble/issues

FAQ

<details>
<summary>What is antifragile?</summary>

The opposite of fragile.

Simply, antifragility is defined as a convex response to a stressor or source of harm (for some range of variation), leading to a positive sensitivity to increase in volatility (or variability, stress, dispersion of outcomes, or uncertainty, what is grouped under the designation "disorder cluster"). Likewise fragility is defined as a concave sensitivity to stressors, leading a negative sensitivity to increase in volatility. The relation between fragility, convexity and sensitivity to disorder is mathematical, obtained by theorem, not derived from empirical data mining or some historical narrative. It is a priori

https://en.wikipedia.org/wiki/Antifragile

</details>

<details>
<summary>What does flexibility in software development mean?</summary>

The quality attribute `flexibility` is the act of designing software systems components in a modular way. Each component can be replaceable over time without having to re-create the whole system.
</details>

<details>
<summary>What is scalability?</summary>

When a system is scalable, it can take on growth over time.

Scalability is the property of a system to handle a growing amount of work by adding resources to the system.

https://en.wikipedia.org/wiki/Scalability
</details>

<details>
<summary>What is maintainability?</summary>

By applying additional features to the software system, the system's complexity increases, which increases the need to keep the system current, which is called software maintenance. By designing a system with maintenance identified and the process documented, tracking can occur so that there is always an awareness of the effort required to keep the system operational.
</details>

<details>
<summary>What is backend as a service?</summary>

Backend-as-a-Service (BaaS) is a cloud service model in which developers outsource all the behind-the-scenes aspects of a web or mobile application to only have to write and maintain the frontend.

BaaS vendors provide pre-written software for activities on servers, such as user authentication, database management, remote updating, push notifications (for mobile apps), and cloud storage and hosting.

https://www.cloudflare.com/learning/serverless/glossary/backend-as-a-service-baas/

</details>

<details>
<summary>What are microservices?</summary>

Microservices - also known as the microservice architecture - is an architectural style that structures an application as a collection of services that are

* Highly maintainable and testable
* Loosely coupled
* Independently deployable
* Organized around business capabilities
* Owned by a small team

The microservice architecture enables the rapid, frequent, and reliable delivery of large, complex applications. It also allows an organization to evolve its technology stack.

https://microservices.io/


</details>

<details>
<summary>What is a persistence layer?</summary>

A persistence layer is a layer in the software stack responsible for storing data for an application. Organizing applications into three common layers:

* Presentation Layer - Interfaces
* Business Layer - Rules and Logic
* Persistence Layer - Data Management

</details>

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

