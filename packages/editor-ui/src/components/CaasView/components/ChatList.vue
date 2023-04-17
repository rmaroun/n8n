<template>
	<div>
			<section class="chatlist" :class="showSelBox>0?'chatlist-bottom-collapse':'chatlist-bottom'">
					<mt-loadmore :top-method="loadTop" top-pull-text="Load more" top-drop-text="Release load" @top-status-change="handleTopChange" ref="loadmore">
							<ul>
									<template v-for="item in records">
											<li class="chat-mine" v-if="item.type==1">
													<div class="chat-user"><img src="../assets/user.png"></div>
													<div class="time"><cite><i>{{item.time}}</i>{{item.name}}</cite></div>
													<div class="chat-text" v-html="item.content"></div>
											</li>
											<li v-if="item.type==2">
													<div class="chat-user"><img src="../assets/default.png"></div>
													<div class="time"><cite>{{item.name}}<i>{{item.time}}</i></cite></div>
													<div class="chat-text" v-html="item.content"></div>
													<!--<div v-html="markdownToHtml(item.content)"></div>-->
											</li>
									</template>
							</ul>
					</mt-loadmore>
			</section>

			<section class="foot">
					<input id="txtContent" placeholder="Please describe your connector flow" class="con" v-model="content" />
					<span class="btn btn-send" v-on:click="sendMsg">Send</span>
			</section>
	</div>
</template>

<script>
import util from '../common/util';

export default {
	name: 'chatlist',
	data() {
			return {
					showSelBox: 0, // 0隐藏 1显示表情 2显示其他
					selFace: 'Expression',
					selOther: 'Other functions',
					content:'',
					topStatus: '',
					//聊天记录
					records: [{
							type: 2,
							time: util.formatDate.format(new Date(),'yyyy-MM-dd hh:mm:ss'),
							name: 'YuzeAI',
							content: 'Hello please describe your Yuzedata connector flow！'
					}],
					// 表情
					EXPS: []
			}
	},
	methods: {
			markdownToHtml(description) {
				return description;// marked(description);
			},
			getEXP: function (pageNow,pageSize) {
					return this.EXPS.slice((pageNow - 1) * pageSize, pageSize * pageNow)
			},
			//发送消息
			sendMsg: function(){
					var _this=this;

					if(this.content==''){
							alert('Please describe your connector flow');
							return;
					}

					this.records.push({
							type: 1,
							time: util.formatDate.format(new Date(),'yyyy-MM-dd hh:mm:ss'),
							name: 'Tourists',
							content: this.content
					});

					setTimeout(function(){
							_this.records.push({
									type: 2,
									time: util.formatDate.format(new Date(),'yyyy-MM-dd hh:mm:ss'),
									name: 'customer service MM',
									content: `Here's the n8n JSON code for the flow you described:\`\`\`json
									{
										"nodes": [
											{
												"parameters": {
													"interval": 604800000,
													"timezone": "America/Los_Angeles"
												},
												"name": "Weekly Trigger",
												"type": "n8n-nodes-base.timeTrigger",
												"typeVersion": 1,
												"position": [250, 300]
											},
											{
												"parameters": {
													"additionalFields": { "maxResults": 10, "query": "openai" }
												},
												"name": "Get Tweets",
												"type": "n8n-nodes-base.twitter",
												"typeVersion": 1,
												"position": [450, 300]
											},
											{
												"parameters": {
													"functionCode": "const summary = items[0].json.data.map(tweet => tweet.text).join('\\');\return [{json: {summary}}];"
												},
												"name": "Summarize Tweets",
												"type": "n8n-nodes-base.function",
												"typeVersion": 1,
												"position": [650, 300]
											},
											{
												"parameters": {
													"toEmails": "info@toto.com",
													"subject": "Weekly OpenAI Tweets Summary",
													"text": "Here's a summary of the top 10 tweets about OpenAI from the past week:\\{{$json.summary}}"
												},
												"name": "Send Email",
												"type": "n8n-nodes-base.emailSend",
												"typeVersion": 1,
												"position": [850, 300]
											}
										],
										"connections": {
											"Weekly Trigger": {
												"main": [[{ "node": "Get Tweets", "type": "main", "index": 0 }]]
											},
											"Get Tweets": {
												"main": [[{ "node": "Summarize Tweets", "type": "main", "index": 0 }]]
											},
											"Summarize Tweets": {
												"main": [[{ "node": "Send Email", "type": "main", "index": 0 }]]
											}
										}
									}
									\`\`\`
									You will need to add your Twitter API credentials to the \`Get Tweets\` node and your email credentials to the \`Send Email\` node before running this flow.
								`});
					},100);

					this.content='';

					this.scrollToBottom();

			},
			focusTxtContent:function(){
					document.querySelector("#txtContent input").focus();
			},
			scrollToBottom:function(){
					setTimeout(function(){
							var chatlist = document.getElementsByClassName('chatlist')[0];
							chatlist.scrollTop=chatlist.scrollHeight;
					},100);
			},
			replaceFace:function(con){
					var _this=this;
					var exps=this.EXPS;
					for(var i=0;i<exps.length;i++){
							//con = con.replace(new RegExp(exps[i].code,'g'), '<img src="static/emotion/' + exps[i].file +'"  alt="" />');
							con = con.replace(exps[i].reg, '<img src="static/emotion/' + exps[i].file +'"  alt="" />');
					}
					return con;
			},
			handleTopChange(status) {
					this.topStatus = status;
			},
			loadTop(id) {
					var _this=this;
					setTimeout(() => {
							var chatlist = document.getElementsByClassName('chatlist')[0];
							var oldHeight=chatlist.scrollHeight;

							_this.records.unshift({
									type: 1,
									time: util.formatDate.format(new Date(),'yyyy-MM-dd hh:mm:ss'),
									name: 'Tourists',
									content: 'Hello! 13213'
							}, {
									type: 2,
									time: util.formatDate.format(new Date(),'yyyy-MM-dd hh:mm:ss'),
									name: 'Customer MM',
									content: 'Here is <a target="_blank" href="https://github.com/taylorchen709/vue-chat">source code</a>13213'
							});

							setTimeout(function(){
									var newHeight=chatlist.scrollHeight;
									chatlist.scrollTop=newHeight-oldHeight;
							},100);

							this.$refs.loadmore.onTopLoaded(id);
					}, 1500);
			}
	},
	mounted:function(){
			this.scrollToBottom();
			this.focusTxtContent();
	}
	// updated:function(){
	//     this.scrollToBottom();
	// }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
	.chatlist {
			position: absolute;
			top: 60px;
			bottom: 48px;
			left: 200px;
			right: 0px;
			overflow-y: scroll;
			overflow-x: hidden;
			padding: 10px;
	}

	.chatlist-bottom {
			bottom: 48px;
	}

	.chatlist-bottom-collapse {
			bottom: 198px;
	}

	.chatlist ul {
			min-height: 300px;
	}

	.chatlist ul .chat-mine {
			text-align: right;
			padding-left: 0;
			padding-right: 60px;
	}

	.chatlist ul li {
			position: relative;
			/*font-size: 0;*/
			margin-bottom: 10px;
			padding-left: 60px;
			min-height: 68px;
	}

	.chat-mine .chat-user {
			left: auto;
			right: 3px;
	}

	.chat-user {
			position: absolute;
			left: 3px;
	}

	.chat-text,
	.chat-user {
			display: inline-block;
			vertical-align: top;
			/*font-size: 14px;*/
	}

	.chat-user img {
			width: 40px;
			height: 40px;
			border-radius: 100%;
	}

	.time {
			width: 100%;
	}

	cite {
			left: auto;
			right: 60px;
			text-align: right;
	}

	cite {
			font-style: normal;
			line-height: 24px;
			font-size: 12px;
			white-space: nowrap;
			color: #999;
			text-align: left;
	}

	cite i {
			font-style: normal;
			padding-left: 5px;
			padding-right: 5px;
			font-size: 12px;
	}

	.chat-mine .chat-text {
			margin-left: 0;
			text-align: left;
			background-color: #33DF83;
			color: #fff;
	}

	.chat-text {
			position: relative;
			line-height: 22px;
			/*margin-top: 25px;*/
			padding: 10px 15px;
			background-color: #eee;
			border-radius: 3px;
			color: #333;
			word-break: break-all;
			max-width: 462px\9;
	}

	.chat-text,
	.chat-user {
			display: inline-block;
			vertical-align: top;
			font-size: 14px;
	}

	.chat-text img {
			max-width: 100%;
			vertical-align: middle;
	}

	.chat-user {
			position: absolute;
			left: 3px;
	}

	.chat-text:after {
			content: '';
			position: absolute;
			left: -10px;
			top: 15px;
			width: 0;
			height: 0;
			border-style: solid dashed dashed;
			border-color: #eee transparent transparent;
			overflow: hidden;
			border-width: 10px;
	}

	.chat-mine .chat-text:after {
			left: auto;
			right: -10px;
			border-top-color: #33DF83;
	}

	.foot {
			width: 80%;
			min-height: 48px;
			position: fixed;
			bottom: 0px;
			left: 200px;
			background-color: #F8F8F8;
	}

	.foot .con {
		position: absolute;
		left: 20px;
		line-height: 30px;
		top: 5px;
		right: 80px;
	}

	.foot .btn-plus {
			width: 28px;
			padding: 9px 3px;
			position: absolute;
			left: 0px;
			border-left: 1px solid #d9d9d9;
	}

	.foot .btn-plus i {
			font-size: 2em;
			color: #ccc;
	}

	.foot .btn-face {
			width: 28px;
			padding: 9px 3px 9px 0px;
			position: absolute;
			left: 35px;
			/*border-right: 1px solid #d9d9d9;*/
	}

	.foot .btn-face i {
			font-size: 2em;
			color: #d9d9d9;
	}

	.foot .selbox {
			height: 150px;
			margin-top: 48px;
			border-top: 1px solid #d9d9d9;
	}

	.show {
			display: block;
	}

	.hide {
			display: none;
	}

	.face-box {
			/* position: absolute; */
			/* top: 48px; */
			/* left: 0px; */
			/* right: 0px; */
			/* bottom: 0px; */
			padding: 15px 15px 0px 15px;
			overflow: hidden;
			width: 290px;
			margin: 0px auto;
			height: 135px;
	}

	.face-box li {
			width: 30px;
			float: left;
			padding: 6px 10px 0px 8px;
	}

	.btn {
			display: inline-block;
			vertical-align: top;
			font-size: 14px;
			line-height: 32px;
			margin-left: 5px;
			padding: 0 6px;
			background-color: #33DF83;
			color: #fff;
			border-radius: 3px;
	}

	.btn-send {
		text-align: center;
    position: absolute;
    right: 5px;
    width: 65px;
    top: 7px;
	}
</style>
