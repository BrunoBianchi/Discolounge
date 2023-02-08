const FormData = require("form-data");
var CLIENT_ID = process.env.CLIENT_ID
var  CLIENT_SECRET = process.env.CLIENT_SECRET
const functions = require("../functions/functions")

const { request } = require('undici');
module.exports = async function(app,disc_url,redirect,nodecache) {
app.get("/:lang/callback",functions.languages,async (req, res) => {
    var uri = req.query.state;
    var lang = req.cookies.lang
    if (!req.query.code) return res.redirect(`/${lang}/login`)
    const code = req.query.code;
    const creds = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
    const response = await request('https://discord.com/api/oauth2/token', {
      method: 'POST',
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri:  redirect,
        scope: 'identify guilds guilds.join',
      }).toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
      })
      const json = await response.body.json();
      res.cookie('token',json.access_token, { maxAge:365*24*3600, httpOnly: true })
      if (uri && uri != "undefined") return res.redirect(`/${uri.split(';')[0]}`);
      else return res.redirect(`/${lang}/dashboard`);


  });

}