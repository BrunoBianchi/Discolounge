const Server = require("../modals/server");

const fs = require('fs')
module.exports = function (app, disc_url, redirect, nodecache, client) {

fs.open('./src/public/sitemaps.xml',async (err,file)=>{
  if(!file) {
    try {
      var servers = ''
      var other_pages  = ''
      
      fs.readdir('./src/languages/',(err,langs)=>{
        langs.forEach(async lang=>{
        await client.guilds.cache.forEach((server) => {
            servers += `<url>
            <loc>https://discolounge.net/${lang.split('.json')[0]}/server/${server.id}</loc>
            <changefreq>monthly</changefreq>
            <priority>1.0</priority>
            <image:image>
            <image:loc>https://cdn.discordapp.com/icons/${server.id}/${server.icon}.png</image:loc>
            </image:image>
            </url>`
          })
        })
        

   
      app._router.stack
      .filter((r) => {
        if (
          r.route != undefined &&
          r.route.path != undefined &&
          !r.route.path.includes("/dashboard") &&
          !r.route.path.includes("/blog") &&
          !r.route.path.includes("/admin") &&
          !r.route.path.includes("delete") &&
          !r.route.path.includes("add") &&
          !r.route.path.includes("create") &&
          !r.route.path.includes("/callback") &&
          !r.route.path.includes("sitemap") &&
          !r.route.path.includes("send") &&
          !r.route.path.includes("update") &&
          !r.route.path.includes("change")
        ) {
          return r.route.stack.filter((r) => r.method === "get" && !r.params);
        }
      })
      .forEach((r) => {
        langs.forEach(async lang=>{
        other_pages += `<url>
        <loc>https://discolounge.net/${lang.split('.json')[0]}/${r.route.path}</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
        <image:image>
        <image:loc>https://cdn.discordapp.com/icons/1042848358701736036/637b11544bece733c840a8caed35d01e.png</image:loc>
        </image:image>
        </url>`
      })
      });
      let data = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
        ${servers}
        ${other_pages}
      </urlset>
      `
        fs.writeFile("./src/public/sitemaps.xml",data, (err) => { 
        })

      });
    } catch (e) {
      console.log(e);
    }

  }
})


};
