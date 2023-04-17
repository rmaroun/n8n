<template>
	<div id="chatapp">
		<div :class="$style.execListWrapper">
			<div :class="$style.execList">
				<div :class="$style.execListHeader">
					<n8n-heading tag="h1" size="2xlarge">{{ this.pageTitle }}</n8n-heading>
				</div>
				<!--<div>
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
				</div>-->
			</div>
		</div>
		<ChatList>
		</ChatList>
	</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { useUIStore } from '@/stores/ui';
import { mapStores } from 'pinia';
import { setPageTitle } from '@/utils';
import axios from 'axios';
import ChatList from './components/ChatList.vue';
// import Heads from './components/Heads.vue';

export default Vue.extend({
	name: 'caas-landing-page',
	data() {
		return {
      messages: [],
      currentMessage: null
    }
	},
	components: {
    // Heads,
    ChatList
	},
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
			await axios.post('/api/yuzeai', { message }).then( (response) => {
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

	/*body {
		margin: 0px;
		padding: 0px;
		font-family: Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, SimSun, sans-serif;
		overflow: hidden;
	}*/

  blockquote,
  body,
  button,
  dd,
  div,
  dl,
  dt,
  form,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  input,
  li,
  ol,
  p,
  pre,
  td,
  textarea,
  th,
  ul {
    margin: 0;
    margin-top: 0px;
    margin-right: 0px;
    margin-bottom: 0px;
    margin-left: 0px;
    padding: 0;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  }

  ul,
  li {
    list-style: none;
  }

  a {
    color: #666;
  }
  /*定义滚动条高宽及背景 高宽分别对应横竖滚动条的尺寸*/

  ::-webkit-scrollbar {
    width: 10px;
    height: 10px;
    background-color: #F8F8F8;
  }
  /*定义滚动条轨道 内阴影+圆角*/

  ::-webkit-scrollbar-track {
    background-color: #F8F8F8;
  }
  /*定义滑块 内阴影+圆角*/

  ::-webkit-scrollbar-thumb {
    background-color: #e2e2e2;
  }

	#chatapp {
    overflow: hidden;
  }

</style>
