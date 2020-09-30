var sapperWorkshop = (function () {
    'use strict';

    function noop() { }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    /* src/App.svelte generated by Svelte v3.28.0 */

    function create_fragment(ctx) {
    	let header;
    	let nav;
    	let t7;
    	let a4;
    	let t8;
    	let main;
    	let button;
    	let t10;
    	let h1;
    	let t12;
    	let p0;
    	let t14;
    	let hr;
    	let t15;
    	let h30;
    	let t17;
    	let p1;
    	let t19;
    	let h31;
    	let t21;
    	let p2;
    	let t23;
    	let h32;
    	let t25;
    	let p3;
    	let t27;
    	let h33;
    	let t29;
    	let section0;
    	let t67;
    	let section1;
    	let t87;
    	let h36;
    	let t89;
    	let section2;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			header = element("header");
    			nav = element("nav");

    			nav.innerHTML = `<a href="/">Home</a> 
    <a href="/sapper-workshop">Sapper Workshop</a> 
    <a href="/about">About</a> 
    <a href="https://discord.gg/zcAXBK">Chat</a>`;

    			t7 = space();
    			a4 = element("a");
    			a4.innerHTML = `<img src="/sapper-workshop-banner.png" alt="Sapper Workshop Banner"/>`;
    			t8 = space();
    			main = element("main");
    			button = element("button");
    			button.textContent = "Register: $100";
    			t10 = space();
    			h1 = element("h1");
    			h1.textContent = "Sapper + TailwindCSS Workshop";
    			t12 = space();
    			p0 = element("p");
    			p0.textContent = "October 29 and 30 from 10am to 1pm EST each day";
    			t14 = space();
    			hr = element("hr");
    			t15 = space();
    			h30 = element("h3");
    			h30.textContent = "What is Sapper?";
    			t17 = space();
    			p1 = element("p");
    			p1.textContent = "Sapper is a nodejs web application framework for Svelte. This framework gives you high performance and scale out of the box. When building full web applications features like server-side rendering, code-splitting and client-server routing become a must, but you don't want to lose the development ergnomics of a component based architecture. Sapper gives you the best of both worlds without having to think about it. You can build your routes and directories and files and sapper takes care of the server-side rendering and code-splitting for your application.";
    			t19 = space();
    			h31 = element("h3");
    			h31.textContent = "What is TailwindCSS?";
    			t21 = space();
    			p2 = element("p");
    			p2.textContent = "Tailwind CSS is a utility based css framework, that gives you the power of css in your html by using small re-usable classes to craft your styles in a highly composable way. Tailwind CSS is quickly becoming a front runner for css frameworks and working with it and Svelte and Sapper is a great fit. In this workshop, we will build our high performant application using Tailwind CSS to create a great looking web application with minimum effort.";
    			t23 = space();
    			h32 = element("h3");
    			h32.textContent = "About the workshop";
    			t25 = space();
    			p3 = element("p");
    			p3.textContent = "This workshop will be three hours on Oct 29 and three hours on Oct 30, in which we will code together a web application from beginning to end, using a Test Driven Development flow, which means, we will write the tests, then write the code and work through each feature to build a fully functioning web application. You can choose to participate and code along or choose to watch and learn. It will be packed full of good information and the pace will have checkpoints for every lesson so if you get behind you can quickly catch up using git.";
    			t27 = space();
    			h33 = element("h3");
    			h33.textContent = "What will we cover in the workshop?";
    			t29 = space();
    			section0 = element("section");

    			section0.innerHTML = `<aside><h4>Sapper</h4> 

<ul><li>How to setup a Sapper Project?</li> 
  <li>Server-Side Rendering</li> 
  <li>Routing</li> 
  <li>Authentication and Authorization</li> 
  <li>Form Management</li> 
  <li>Svelte Stores</li> 
  <li>Transitions</li> 
  <li>End to End Testing</li> 
  <li>Unit Testing</li></ul></aside> 
  <aside><h4>Tailwind CSS</h4> 

<ul><li>Setting up Tailwind with Sapper</li> 
  <li>Utility First Concept</li> 
  <li>Responsive Design</li> 
  <li>Pseudo-Class variants</li> 
  <li>Adding base styles</li> 
  <li>Flexbox</li> 
  <li>Grid</li> 
  <li>And more...</li></ul></aside>`;

    			t67 = space();
    			section1 = element("section");

    			section1.innerHTML = `<aside><h3>Prerequisites</h3> 

<ul><li><a href="https://svelte.dev">Svelte v3 or greater</a></li> 
  <li><a href="https://nodejs.org">NodeJS v12 or greater</a></li> 
  <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript">JavaScript</a></li> 
  <li><a href="https://developer.mozilla.org/en-US/docs/Web/HTML">HTML and CSS</a></li></ul></aside> 
  <aside><h3>Tools you will need</h3> 

<ul><li>NodeJS</li> 
  <li>git</li> 
  <li>Code Editor</li> 
  <li>Browser</li></ul></aside>`;

    			t87 = space();
    			h36 = element("h3");
    			h36.textContent = "About the Instructor";
    			t89 = space();
    			section2 = element("section");

    			section2.innerHTML = `<figure><img style="border-radius: 100%" src="/tnw.jpeg" alt="Tom Wilson"/></figure> 
<p>Tom Wilson has been in the software development industry for over 25 years. Continuous learning and teaching have been a part of his journey. Since 2007, Tom has participated in the tech community hosting and running meetups and providing workshops focused on software development. In 2016, Tom launched a coding school in Charleston, SC, JRS Coding School, focused on full-stack javascript. In 2020, Tom founded hyper63; a company focused on leading engineers from beginner to expert. <a href="https://www.linkedin.com/in/twilson63/">LinkedIn</a></p>`;

    			set_style(button, "float", "right");
    			set_style(section2, "display", "flex");
    			set_style(section2, "flex-direction", "row");
    		},
    		m(target, anchor) {
    			insert(target, header, anchor);
    			append(header, nav);
    			append(header, t7);
    			append(header, a4);
    			insert(target, t8, anchor);
    			insert(target, main, anchor);
    			append(main, button);
    			append(main, t10);
    			append(main, h1);
    			append(main, t12);
    			append(main, p0);
    			append(main, t14);
    			append(main, hr);
    			append(main, t15);
    			append(main, h30);
    			append(main, t17);
    			append(main, p1);
    			append(main, t19);
    			append(main, h31);
    			append(main, t21);
    			append(main, p2);
    			append(main, t23);
    			append(main, h32);
    			append(main, t25);
    			append(main, p3);
    			append(main, t27);
    			append(main, h33);
    			append(main, t29);
    			append(main, section0);
    			append(main, t67);
    			append(main, section1);
    			append(main, t87);
    			append(main, h36);
    			append(main, t89);
    			append(main, section2);

    			if (!mounted) {
    				dispose = [
    					listen(a4, "click", /*startCheckout*/ ctx[0]),
    					listen(button, "click", /*startCheckout*/ ctx[0])
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(header);
    			if (detaching) detach(t8);
    			if (detaching) detach(main);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let stripe = Stripe("pk_test_51HUW8YCdTeU3dtdYIiHByOYhIBsqLN9ImmkfOkbZ1AcIWxQbrVMtfyzqlakNzdVHnlYTU1WXqv52o0fbXKcqFemW00Ig3U26Is");
    	let { sku } = $$props;
    	let { amount } = $$props;
    	let { name } = $$props;

    	async function startCheckout() {
    		const { error } = await stripe.redirectToCheckout({
    			lineItems: [
    				{
    					price: "price_1HWph3CdTeU3dtdYoULHTDCw",
    					quantity: 1
    				}
    			],
    			mode: "payment",
    			successUrl: window.location.origin + "/sapper-workshop-success",
    			cancelUrl: window.location.origin + "/sapper-workshop"
    		});

    		if (error) {
    			alert("our payment system is broken");
    		}
    	}

    	$$self.$$set = $$props => {
    		if ("sku" in $$props) $$invalidate(1, sku = $$props.sku);
    		if ("amount" in $$props) $$invalidate(2, amount = $$props.amount);
    		if ("name" in $$props) $$invalidate(3, name = $$props.name);
    	};

    	return [startCheckout, sku, amount, name];
    }

    class App extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance, create_fragment, safe_not_equal, { sku: 1, amount: 2, name: 3 });
    	}
    }

    var main = new App({target: document.body, props: {
      sku: 'prod_I73oYiiLUL8myW'
    }});

    return main;

}());
