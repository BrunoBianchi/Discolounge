const Bots = require(`${__dirname.split('src')[0]}/src/modals/bots`);
module.exports = function(app) {
app.get("/bots/search",(req,res)=>{
  if(!req.query.page) {
    if(Object.keys(req.query).length === 0 || !Object.keys(req.query).length === 1) return res.redirect(`${req.originalUrl}?page=1`)
    else return res.redirect(`${req.originalUrl}&page=1`)
  } 
  else  var page = Math.abs((req.query.page - 1)*9 )  
  var next_page = page + 9
    var query = req.query
   
    Bots.find({status:{ $ne: 'denied' }},(err,result)=>{
      if( query.tags)  query.tags = query.tags.split(',')
      var bots = result.filter(s => {
        try{
          return Object.keys(query).filter(q=>{return(q!= 'filter' && q != 'page')}).every(filter => { 
            if(filter === 'tags') {
              return s['tags'].some(function(e) {
                for(let i in query.tags) {
                  return e.name === query.tags[i];
                }     
            });
            } 
            if(filter === 'serversCount') {

              return s['serversCount'].toString() >= query['serversCount'].toString()
            }

            return s[filter].toString() === query[filter].toString() ||  s[filter].toString().includes(query[filter].toString()) 

        });
        }catch(err) {
          return 
        }

       
  })
  if(req.query.filter) {
    if(req.query.filter === 'reviews') {
      bots.sort((a,b)=>{ 
        var mb = b['reviews']['averageStars'] / b['reviews']['rates'].length ? b['reviews']['averageStars'] / b['reviews']['rates'].length : 0; 
        var ma = a['reviews']['averageStars'] / a['reviews']['rates'].length ? a['reviews']['averageStars'] / a['reviews']['rates'].length: 0 ; 
        return (mb-ma) 
      })
    }else {
      bots.sort((a,b)=>{ 
        return (b[req.query.filter] - a[req.query.filter]) || (b[ Object.keys(query)[0]] - a[ Object.keys(query)[0]]) || (b.premium - a.premium) ||   new Date(b.lastBump) -  new Date(a.lastBump) 
      })
    }
  } 
  else bots.sort((a,b)=>{ 
    return  (b[ Object.keys(query)[0]] - a[ Object.keys(query)[0]]) || (b.premium - a.premium) || new Date(b.lastBump) -  new Date(a.lastBump) 
  })
  res.render("./bots/search",{data:bots.slice(page,next_page),page:req.query.page})
})

})
app.get("/bots/searchName",(req,res)=>{

  var name = req.query.name
  Bots.find({status:{ $ne: 'denied' }},(err,result)=>{
         var results = []
  results = result.filter(bot=>bot.name.includes(name)).sort(() => Math.random() - 0.5).slice(0,8)
  return res.json({data:results})
 })
})
}