<script lang="ts">
	import { SignIn, SignOut } from '@auth/sveltekit/components'
	import { page } from '$app/stores'
	import {
		Navbar,
		NavBrand,
		NavLi,
		NavUl,
		NavHamburger,
		Dropdown,
		DropdownHeader,
		DropdownItem,
		DropdownDivider,
		Avatar,
	} from 'flowbite-svelte'
	$: activeUrl = $page.url.pathname
	let activeClass =
		'text-white bg-green-700 md:bg-transparent md:text-green-700 md:dark:text-white dark:bg-green-600 md:dark:bg-transparent'
	let nonActiveClass =
		'text-gray-700 hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-green-700 dark:text-gray-400 md:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent'
</script>

<Navbar>
	<NavBrand href="/">
		<img
			src="/images/flowbite-svelte-icon-logo.svg"
			class="me-3 h-6 sm:h-9"
			alt="Flowbite Logo"
		/>
		<span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white"
			>Flowbite</span
		>
	</NavBrand>
	<div class="flex items-center md:order-2">
		<Avatar id="avatar-menu" src={$page.data.session?.user?.image} />
		<NavHamburger class1="w-full md:flex md:w-auto md:order-1" />
	</div>
	<Dropdown placement="bottom" triggeredBy="#avatar-menu">
		<DropdownHeader>
			<span class="block text-sm">{$page.data.session?.user?.name}</span>
			<span class="block truncate text-sm font-medium">{$page.data.session?.user?.email}</span
			>
		</DropdownHeader>
		<DropdownItem>Dashboard</DropdownItem>
		<DropdownItem>Settings</DropdownItem>
		<DropdownItem>Earnings</DropdownItem>
		<DropdownDivider />
		<DropdownItem><SignOut><span slot="submitButton">Sign out</span></SignOut></DropdownItem>
	</Dropdown>
	<NavUl {activeUrl} {activeClass} {nonActiveClass}>
		<NavLi href="/" active={true}>Home</NavLi>
		<NavLi href="/about">About</NavLi>
		<NavLi href="/pricing">Pricing</NavLi>
		<NavLi href="/contact">Contact</NavLi>
		<NavLi><SignIn><span slot="submitButton">Sign In</span></SignIn></NavLi>
	</NavUl>
</Navbar>
