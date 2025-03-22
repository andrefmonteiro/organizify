<script setup lang="ts">
import NavigationMenu from './components/common/navigation-menu/NavigationMenu.vue';
import NavigationMenuContent from './components/common/navigation-menu/NavigationMenuContent.vue';
import NavigationMenuItem from './components/common/navigation-menu/NavigationMenuItem.vue';
import NavigationMenuLink from './components/common/navigation-menu/NavigationMenuLink.vue';
import NavigationMenuList from './components/common/navigation-menu/NavigationMenuList.vue';
import NavigationMenuTrigger from './components/common/navigation-menu/NavigationMenuTrigger.vue';
import Switch from './components/ui/switch/Switch.vue';


</script>

<template>
  <div>
    <p class="text-green-800">Hello World</p>
    <Button size="lg">Click me</Button>
    <Switch/>
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Item One</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink>Link</NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  </div>
</template>
