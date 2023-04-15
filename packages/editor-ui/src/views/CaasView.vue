<template>
	<CaasList />
</template>

<script lang="ts">
import Vue from 'vue';
import CaasList from '@/components/CaasList.vue';

export default Vue.extend({
	name: 'CaasView',
	components: {
		CaasList,
	},
});
</script>
