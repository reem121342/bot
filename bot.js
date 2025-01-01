const {MessageEmbed , WebhookClient, MessageAttachment} = require("discord.js");
const Gamedig = require('gamedig');
const {createCanvas , loadImage} = require('canvas');
const fs = require('fs')

const WBID = "1314841628501872730";
const ServerInfo = [
    "49.13.123.107",
    "28616",
]
var IntervalPlay = false;

const webhookClient =  new WebhookClient({
    url: "https://discord.com/api/webhooks/1323635824201564260/rJ1Kumda0681PNkCtJ_FbbE2A8h6psS68Z5RpJ6wRS7aszFNwrfZ1wGFQfG6S1aEhgbL"
});

function secondsToDhms(seconds) {
	seconds = Number(seconds);
	var d = Math.floor(seconds / (3600*24));
	var h = Math.floor(seconds % (3600*24) / 3600);
	var m = Math.floor(seconds % 3600 / 60);
	var s = Math.floor(seconds % 60);

	var dDisplay = d >= 0 ? d + (d == 1 ? " يوم " : " أيام ") : "";
	var hDisplay = h >= 0 ? h + (h == 1 ? " ساعة " : " ساعات ") : "";
	var mDisplay = m >= 0 ? m + (m == 1 ? " دقيقة " : " دقائق ") : "";
	var sDisplay = s >= 0 ? s + (s == 1 ? " ثانية" : " ثواني ") : "";
	return sDisplay + " / " + mDisplay + " / " + hDisplay + " / " + dDisplay;
}

var upTime = 0;

function StartServerCollector(){
    setInterval(() => {
        if (IntervalPlay){
            upTime = upTime + 1;
        }else{
            upTime = 0
        }
       
    }, 1000);
}


const UpdateServerStats = async () => {
    var current = new Date();
    var playersNow = 0;
    let data = fs.readFileSync('Stats.json');
    let ArabScriptTopStats = JSON.parse(data);
    Gamedig.query({
        type: 'mtasa',
        host: ServerInfo[0],
        port: ServerInfo[1]
    }).then(async(state) => {
    if (state.ping >= 1){
        if (state.players <= 0) {
            playersNow = 0;
        }else{
            playersNow = state.players.length
        }
        const canvas = createCanvas(840,36);
        const ctx = canvas.getContext('2d');
        bar_width = 900
        serverMembers = playersNow
        maxMembers = state.maxplayers


        let ServerStatsJson = { 
            TopPlayers: serverMembers
        
        };
         
        let data = JSON.stringify(ServerStatsJson, null, 2);
        if (ArabScriptTopStats.TopPlayers < serverMembers){
        fs.writeFile('Stats.json', data, (err) => {
            if (err) throw err;
        });
        }


        ctx.lineJoin = "miter";
        ctx.lineWidth = 30;
        ctx.strokeStyle = "grey"
        ctx.strokeRect(10,10,bar_width,0) 

        ctx.strokeStyle = "#01A02C"
        ctx.strokeRect(10,10,(bar_width * serverMembers / maxMembers),0) 

        fs.writeFileSync('./ArabScript.png', canvas.toBuffer('image/png'))
        IntervalPlay = true;
        const file = new MessageAttachment('./ArabScript.png');
        const ServerStats = new MessageEmbed()
        .setColor("GREEN")
        .setTitle(" > **🟢 أونلاين **")
        .addFields(
            { name: '**⚡ أسم الخادم**', value: "**"+state.name+"**", inline: true },
            { name: '**<a:750483154774655050:781324719193980938> المتصلين**', value: `**${playersNow}/${state.maxplayers}**`, inline: true },
            { name: '**<a:649680101511790653:781324714668589086> سرعة الأتصال**', value: "**"+state.ping+"**", inline: true },
            { name: '**⏱ مدة تشغيل الخادم**', value: "**"+secondsToDhms(upTime)+"**", inline: true },
            { name: '**🔗 أيبي السيرفر**', value: "**"+state.connect+"\n`connect "+state.connect+"`\nmtasa://"+state.connect+"**", inline: false },
        )
        .addFields(
            { name: '**📊 الإحصائية**', value: "** أعلي متصلين: "+ArabScriptTopStats.TopPlayers+"**", inline: false },
        )
        .setImage("attachment://ArabScript.png")
        .setFooter('Roleplay Stats [By ArabScript] - ' + current.toLocaleTimeString());
        
        const message = await webhookClient.fetchMessage(WBID)
        if (message) {
            const message = await webhookClient.editMessage(WBID, {
                embeds: [ServerStats],
                files: [file]
            });
        }
    }else{
        IntervalPlay = false;
        const ServerStats = new MessageEmbed()
        .setColor("RED")
        .setTitle(" > **🔴 أوفلاين **")
        .setDescription('**سيرفر أوفلاين راجعين لكم بأقرب وقت**')
        .setFooter('Roleplay Stats [By ArabScript] - ' + current.toLocaleTimeString());
        const message = await webhookClient.fetchMessage(WBID)
        if (message) {
            const message = await webhookClient.editMessage(WBID, {
                embeds: [ServerStats]
            });
        }
    }
    }).catch(async(e) => {
        console.log(e)
        IntervalPlay = false;
        const ServerStats = new MessageEmbed()
        .setColor("ORANGE")
        .setTitle(" > **🟠  خطأ**")
        .setDescription('**هنالك مشكلة عند التأكد من حالة الـسيرفر - أنتظر قليلاً.**')
        .setFooter('Roleplay Stats [By ArabScript] - ' + current.toLocaleTimeString());
        const message = await webhookClient.fetchMessage(WBID)
        if (message) {
            const message = await webhookClient.editMessage(WBID, {
                embeds: [ServerStats]
            });
        }
        UpdateServerStats()
    });
   
}
IntervalPlay = true
StartServerCollector()
console.log("System Ready.")
setTimeout(() => {
    console.log("System started.")
    UpdateServerStats()
}, 1000);

setInterval(() => {
    UpdateServerStats()
}, 5000);