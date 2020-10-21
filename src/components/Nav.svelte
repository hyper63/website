<script>
	export let segment;
</script>

<style>

	[aria-current] {
		position: relative;
		display: inline-block;
	}

	[aria-current]::after {
		position: absolute;
		content: '';
		width: calc(100%);
		height: 2px;
		background-color: rgb(255,62,0);
		display: block;
		bottom: -1px;
	}

</style>
<header>
	<nav>
		<a href="/">
			<div style="display:flex;align-items: center;">
				<img src="/hyper63-logo.svg" style="height: 64px; margin-right: 16px;border-radius: 4px;" alt="logo">
				<span>hyper63</span>
			</div>
		</a>
		<ul>
			<li><a aria-current="{segment === undefined ? 'page' : undefined}" href=".">home</a></li>
			<li><a aria-current="{segment === 'workshops' ? 'page' : undefined}" href="workshops">workshops</a></li>
			
			<li><a aria-current="{segment === 'about' ? 'page' : undefined}" href="about">about</a></li>

		</ul>
</nav>
</header>