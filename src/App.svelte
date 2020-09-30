<script>
  let stripe = Stripe('pk_test_51HUW8YCdTeU3dtdYIiHByOYhIBsqLN9ImmkfOkbZ1AcIWxQbrVMtfyzqlakNzdVHnlYTU1WXqv52o0fbXKcqFemW00Ig3U26Is')

  export let sku
  export let amount
  export let name

  async function startCheckout() {
    const { error } = await stripe.redirectToCheckout({
      lineItems: [{price: 'price_1HWph3CdTeU3dtdYoULHTDCw', quantity: 1}],
      mode: 'payment',
      successUrl: window.location.origin + '/sapper-workshop-success',
      cancelUrl: window.location.origin + '/sapper-workshop'
    })

    if (error) {
      alert('our payment system is broken')
    }
  }
</script>
<header>
  <nav>
    <a href="/">Home</a>
    <a href="/sapper-workshop">Sapper Workshop</a>
    <a href="/about">About</a>
    <a href="https://discord.gg/zcAXBK">Chat</a>
  </nav>
  <a on:click={startCheckout}>
  <img src="/sapper-workshop-banner.png" alt="Sapper Workshop Banner" />
  </a>
</header>
<main>
  <button on:click={startCheckout} style="float: right">Register: $100</button>
<h1>Sapper + TailwindCSS Workshop</h1>
<p>October 29 and 30 from 10am to 1pm EST each day</p>

<hr />

<h3>What is Sapper?</h3>

<p>
Sapper is a nodejs web application framework for Svelte. This framework gives you high performance and scale out of the box. When building full web applications features like server-side rendering, code-splitting and client-server routing become a must, but you don't want to lose the development ergnomics of a component based architecture. Sapper gives you the best of both worlds without having to think about it. You can build your routes and directories and files and sapper takes care of the server-side rendering and code-splitting for your application.
</p>

<h3>What is TailwindCSS?</h3>

<p>
Tailwind CSS is a utility based css framework, that gives you the power of css in your html by using small re-usable classes to craft your styles in a highly composable way. Tailwind CSS is quickly becoming a front runner for css frameworks and working with it and Svelte and Sapper is a great fit. In this workshop, we will build our high performant application using Tailwind CSS to create a great looking web application with minimum effort.
</p>

<h3>About the workshop</h3>

<p>
This workshop will be three hours on Oct 29 and three hours on Oct 30, in which we will code together a web application from beginning to end, using a Test Driven Development flow, which means, we will write the tests, then write the code and work through each feature to build a fully functioning web application. You can choose to participate and code along or choose to watch and learn. It will be packed full of good information and the pace will have checkpoints for every lesson so if you get behind you can quickly catch up using git.
</p>

<h3>What will we cover in the workshop?</h3>

<section>
  <aside>
<h4>Sapper</h4>

<ul>
  <li>How to setup a Sapper Project?</li>
  <li>Server-Side Rendering</li>
  <li>Routing</li>
  <li>Authentication and Authorization</li>
  <li>Form Management</li>
  <li>Svelte Stores</li>
  <li>Transitions</li>
  <li>End to End Testing</li>
  <li>Unit Testing</li>
</ul>
  </aside>
  <aside>

<h4>Tailwind CSS</h4>

<ul>
  <li>Setting up Tailwind with Sapper</li>
  <li>Utility First Concept</li>
  <li>Responsive Design</li>
  <li>Pseudo-Class variants</li>
  <li>Adding base styles</li>
  <li>Flexbox</li>
  <li>Grid</li>
  <li>And more...</li>
</ul>

  </aside>
</section>
<section>
  <aside>
<h3>Prerequisites</h3>

<ul>
  <li><a href="https://svelte.dev">Svelte v3 or greater</a></li>
  <li><a href="https://nodejs.org">NodeJS v12 or greater</a></li>
  <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript">JavaScript</a></li>
  <li><a href="https://developer.mozilla.org/en-US/docs/Web/HTML">HTML and CSS</a></li>
</ul>
  </aside>
  <aside>

<h3>Tools you will need</h3>

<ul>
  <li>NodeJS</li>
  <li>git</li>
  <li>Code Editor</li>
  <li>Browser</li>
</ul>
  </aside>
</section>

<h3>About the Instructor</h3>

<section style="display: flex;flex-direction: row;">
  <figure>
  <img style="border-radius: 100%" src="/tnw.jpeg" alt="Tom Wilson" />
</figure>
<p>
  Tom Wilson has been in the software development industry for over 25 years. Continuous learning and teaching have been a part of his journey. Since 2007, Tom has participated in the tech community hosting and running meetups and providing workshops focused on software development. In 2016, Tom launched a coding school in Charleston, SC, JRS Coding School, focused on full-stack javascript. In 2020, Tom founded hyper63; a company focused on leading engineers from beginner to expert. <a href="https://www.linkedin.com/in/twilson63/">LinkedIn</a>
</p>
</section>

</main>

