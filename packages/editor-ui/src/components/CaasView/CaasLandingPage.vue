<template>
	<div :class="$style.execListWrapper">
		<div :class="$style.execList">
			<div :class="$style.execListHeader">
				<n8n-heading tag="h1" size="2xlarge">{{ this.pageTitle }}</n8n-heading>
			</div>
			<div>
				<n8n-heading tag="h2" size="xlarge" color="text-dark" class="mb-2xs">
					Chat with YuzeAI
				</n8n-heading>
				<div class="hello">
					<input v-model="currentMessage" type="text"> <span><button @click="sendMessage(currentMessage)">Ask</button></span>
					<div class="messageBox">
					<template v-for="message in messages">
						<div :class="message.from=='user' ? 'messageFromUser' :'messageFromChatGpt'" :key="message" v-html="message.data"></div>
					</template>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { useUIStore } from '@/stores/ui';
import { mapStores } from 'pinia';
import { setPageTitle } from '@/utils';
import axios from 'axios';

export default Vue.extend({
	name: 'caas-landing-page',
	data() {
		return {
      messages: [],
      currentMessage: null
    }
	},
	components: {},
	computed: {
		...mapStores(useUIStore),
		pageTitle() {
			return 'Yuze AI - Connectors as a Service'
		},
	},
	mounted() {
		setPageTitle(`n8n - ${this.pageTitle}`);
	},
	methods: {
		onSetupFirstStep(event: MouseEvent): void {
			this.uiStore.addFirstStepOnLoad = true;
		},
		async sendMessage(message: String | null): Promise<any> {
			this.messages.push({
					from: 'user',
					data: message
			})
			await axios.post('http://localhost:3000/ask-to-chat-gpt', { message }).then( (response) => {
					this.messages.push(response.data)
			})
		}
	},
});
</script>

<style scoped module lang="scss">
.execListWrapper {
	display: grid;
	grid-template-rows: 1fr 0;
	position: relative;
	height: 100%;
	width: 100%;
	max-width: 1280px;
}

.execList {
	position: relative;
	height: 100%;
	overflow: auto;
	padding: var(--spacing-l) var(--spacing-l) 0;
	@media (min-width: 1200px) {
		padding: var(--spacing-2xl) var(--spacing-2xl) 0;
	}
}

.execListHeader {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: var(--spacing-s);
}

.execListHeaderControls {
	display: flex;
	align-items: center;
	justify-content: flex-end;
}

.container {
	width: 100%;
	height: 100%;
	flex: 1;
	background-color: var(--color-background-light);
	display: flex;
	flex-direction: column;
	align-items: center;
}

/*.icon {
	font-size: 24px;
	color: var(--color-foreground-dark);
}*/

input {
  width: 300px;
  padding: 10px;
}
button {
  height: 40px;
  background-color: powderblue;
  padding: 10px;
}
.messageBox {
  height: 500px;
  background-color: gainsboro;
  /* margin-left: 10%;
  margin-right: 10%; */
  margin: 0 20% 0 20%;
  margin-top: 20px;
  padding: 5%;
}
.messageFromUser {
  text-align: right;
  background-color: aliceblue;
  border-radius: 10px;
  padding: 10px;
  margin-top: 15px;
  margin-bottom: 15px;
  width: 30%;
  margin-left: 70%;
}
.messageFromChatGpt {
  text-align: left;
  background-color: antiquewhite;
  border-radius: 10px;
  padding: 10px;
  margin-top: 15px;
  margin-bottom: 15px;
  width: 30%;
  margin-right: 70%;
}
</style>
