<script>
	import Nav from '../components/Nav.svelte';

	export let segment;
</script>
<style>
	main {
		position: relative;
		max-width: 56em;
		background-color: white;
		padding: 2em;
		margin: 0 auto;
		box-sizing: border-box;
	}
</style>

<Nav {segment}/>

<main>
	<slot></slot>
</main>

<footer>
	<a href="https://twitter.com/hyper632" target="_blank">twitter</a>
	<a href="https://www.linkedin.com/company/hyper63" target="_blank">linkedin</a>
	<p><a href="/termsofuse">Our Terms of Use</a></p>
	<p><a href="/privacy">Our Privacy Policy</a></p>
	<p>All rights reserved, hyper63, LLC, &copy; 2020</p>
</footer>
