var sapperWorkshop = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
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
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
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
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
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

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }
    function create_component(block) {
        block && block.c();
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

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function scale(node, { delay = 0, duration = 400, easing = cubicOut, start = 0, opacity = 0 }) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const sd = 1 - start;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (_t, u) => `
			transform: ${transform} scale(${1 - (sd * u)});
			opacity: ${target_opacity - (od * u)}
		`
        };
    }

    /* src/components/Modal.svelte generated by Svelte v3.28.0 */

    function create_if_block(ctx) {
    	let div;
    	let section;
    	let aside;
    	let aside_intro;
    	let aside_outro;
    	let modalAction_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	return {
    		c() {
    			div = element("div");
    			section = element("section");
    			aside = element("aside");
    			if (default_slot) default_slot.c();
    			attr(aside, "class", "svelte-163fgjc");
    			attr(section, "class", "svelte-163fgjc");
    			attr(div, "class", "modal svelte-163fgjc");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, section);
    			append(section, aside);

    			if (default_slot) {
    				default_slot.m(aside, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(modalAction_action = modalAction.call(null, div));
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, null, null);
    				}
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (aside_outro) aside_outro.end(1);
    				if (!aside_intro) aside_intro = create_in_transition(aside, scale, {});
    				aside_intro.start();
    			});

    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			if (aside_intro) aside_intro.invalidate();
    			aside_outro = create_out_transition(aside, scale, { duration: 500 });
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && aside_outro) aside_outro.end();
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function create_fragment(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*open*/ ctx[0] && create_if_block(ctx);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (/*open*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*open*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function modalAction(node) {
    	let fns = [];

    	if (document.body.style.overflow !== "hiddent") {
    		const original = document.body.style.overflow;
    		document.body.style.overflow = "hidden";
    		fns = [...fns, () => document.body.style.overflow = original];
    	}

    	return { destroy: () => fns.map(fn => fn()) };
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	let { open = false } = $$props;

    	$$self.$$set = $$props => {
    		if ("open" in $$props) $$invalidate(0, open = $$props.open);
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	return [open, $$scope, slots];
    }

    class Modal extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance, create_fragment, safe_not_equal, { open: 0 });
    	}
    }

    /* src/App.svelte generated by Svelte v3.28.0 */

    function create_default_slot(ctx) {
    	let div;
    	let h1;
    	let t1;
    	let h3;
    	let t3;
    	let p0;
    	let t7;
    	let p1;
    	let t9;
    	let p2;
    	let t12;
    	let p3;
    	let t14;
    	let button;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "🎉 🎉 Success! 🎉 🎉";
    			t1 = space();
    			h3 = element("h3");
    			h3.textContent = "Sapper + Tailwind CSS Workshop Registration Complete";
    			t3 = space();
    			p0 = element("p");
    			p0.innerHTML = `You have successfully registered for the Sapper + Tailwind CSS Workshop on <b>October 29 and 30</b> from 10am to 1pm EST`;
    			t7 = space();
    			p1 = element("p");
    			p1.textContent = "You will recieve a receipt in your inbox shortly. And on October 28, you will receive information on how to join the workshop to participate.";
    			t9 = space();
    			p2 = element("p");
    			p2.innerHTML = `If you have any questions, please email <a href="mailto:workshops@hyper63.com">workshops@hyper63.com</a>`;
    			t12 = space();
    			p3 = element("p");
    			p3.textContent = "Thank you! We are looking forward to the workshop!";
    			t14 = space();
    			button = element("button");
    			button.textContent = "Close";
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, h1);
    			append(div, t1);
    			append(div, h3);
    			append(div, t3);
    			append(div, p0);
    			append(div, t7);
    			append(div, p1);
    			append(div, t9);
    			append(div, p2);
    			append(div, t12);
    			append(div, p3);
    			append(div, t14);
    			append(div, button);

    			if (!mounted) {
    				dispose = listen(button, "click", /*closeModal*/ ctx[2]);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(div);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function create_fragment$1(ctx) {
    	let div1;
    	let header;
    	let nav;
    	let t7;
    	let figure0;
    	let a4;
    	let t8;
    	let main;
    	let button;
    	let t9;
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
    	let t93;
    	let footer;
    	let t106;
    	let modal;
    	let current;
    	let mounted;
    	let dispose;

    	modal = new Modal({
    			props: {
    				open: /*success*/ ctx[0],
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			div1 = element("div");
    			header = element("header");
    			nav = element("nav");

    			nav.innerHTML = `<a href="/">Home</a> 
      <a href="/sapper-workshop">Sapper Workshop</a> 
      <a href="/about">About</a> 
      <a href="https://discord.gg/zcAXBK">Chat</a>`;

    			t7 = space();
    			figure0 = element("figure");
    			a4 = element("a");
    			a4.innerHTML = `<img src="/sapper-workshop-banner.png" alt="Sapper Workshop Banner"/>`;
    			t8 = space();
    			main = element("main");
    			button = element("button");
    			t9 = text("Register: $100");
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

    			t93 = space();
    			footer = element("footer");

    			footer.innerHTML = `<div style="display: flex;align-items:center;"><img style="width: 64px;border-radius: 100%;" src="/hyper63-logo.svg" alt="hyper63 logo"/> 
		  <p style="margin-left: 16px">hyper63</p></div> 
		<a href="https://twitter.com/hyper632" target="_blank">twitter</a> 
		<a href="https://www.linkedin.com/company/hyper63" target="_blank">linkedin</a> 
		<p><a href="/termsofuse.text">Our Terms of Use</a></p> 
		<p><a href="/privacy.text">Our Privacy Policy</a></p> 
		<p>All rights reserved, hyper63, LLC, © 2020</p>`;

    			t106 = space();
    			create_component(modal.$$.fragment);
    			button.disabled = /*success*/ ctx[0];
    			set_style(button, "float", "right");
    			set_style(section2, "display", "flex");
    			set_style(section2, "flex-direction", "row");
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, header);
    			append(header, nav);
    			append(header, t7);
    			append(header, figure0);
    			append(figure0, a4);
    			append(div1, t8);
    			append(div1, main);
    			append(main, button);
    			append(button, t9);
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
    			append(div1, t93);
    			append(div1, footer);
    			insert(target, t106, anchor);
    			mount_component(modal, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen(a4, "click", /*startCheckout*/ ctx[1]),
    					listen(button, "click", /*startCheckout*/ ctx[1])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (!current || dirty & /*success*/ 1) {
    				button.disabled = /*success*/ ctx[0];
    			}

    			const modal_changes = {};
    			if (dirty & /*success*/ 1) modal_changes.open = /*success*/ ctx[0];

    			if (dirty & /*$$scope*/ 16) {
    				modal_changes.$$scope = { dirty, ctx };
    			}

    			modal.$set(modal_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div1);
    			if (detaching) detach(t106);
    			destroy_component(modal, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let stripe = Stripe("pk_live_51HUW8YCdTeU3dtdYnYrJyb6F7TYLWWtNk6vHov8Q06cQ2hDKaNqhbI2mGjPcQqN7PjxQn2rhCEhmOaIVeAlPPiVV001vP95oUK");
    	let success = false;

    	onMount(() => {
    		const params = new URLSearchParams(window.location.search);

    		if (params.get("checkout") === "success") {
    			//window.location.replace('/sapper-workshop')
    			$$invalidate(0, success = true);
    		}
    	});

    	async function startCheckout() {
    		const { error } = await stripe.redirectToCheckout({
    			// test lineItems: [{price: 'price_1HWph3CdTeU3dtdYoULHTDCw', quantity: 1}],
    			lineItems: [
    				{
    					price: "price_1HXBu9CdTeU3dtdYKEV46A0m",
    					quantity: 1
    				}
    			],
    			mode: "payment",
    			successUrl: window.location.origin + "/sapper-workshop?checkout=success",
    			cancelUrl: window.location.origin + "/sapper-workshop?checkout=error"
    		});

    		if (error) {
    			alert("our payment system is broken");
    		}
    	}

    	function closeModal() {
    		$$invalidate(0, success = false);
    		window.location.replace("/sapper-workshop");
    	}

    	return [success, startCheckout, closeModal];
    }

    class App extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});
    	}
    }

    var main = new App({target: document.body, props: {
      sku: 'prod_I73oYiiLUL8myW'
    }});

    return main;

}());
