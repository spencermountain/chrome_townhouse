



function recent(tabs){


  var tablist={};
  for(var i in tabs){
   if(tabs[i].url.match(/^chrome/)){continue;}
   var title=parsetitle(tabs[i].title, tabs[i].url);
   var parsed=parseUri(tabs[i].url);
   var favicon=null;
   if(parsed.host){
     favicon='chrome://favicon/http://'+parsed.host;
   }
   domain=parsed.host.replace(/^www\./,'');
   domain=domain.replace(/\.(org|net|com|co\.uk)/,'');
   //domain=domain.replace(/.*?\.(.{4}.*?)/,'$1');//regex subdomain
   if(!title){title=domain;}
   if(tablist[parsed.host] == null){tablist[parsed.host]={favicon:favicon, sites:[], domain:domain };}
   tablist[parsed.host].sites.push({ url : tabs[i].url, title : title})
 }

 //pivot into an array
 var tabarr=[];
 for(var i in tablist){
  tablist[i].font=parseInt(tablist[i].sites.length/2)+15;
  tabarr.push(tablist[i]);
}
//   tabarr.sort(function(a,b){return b.font-a.font;});


return tabarr;

}

function show_domains(){

  get_history(1, function(tabs){
    //tabs=._filter()
    tabs=recent(tabs);
    var googles=list_googles(tabs);
    var maplist=list_maps(tabs);


    tabs=tabs.slice(0,25);
    //  googles=googles.slice(0,20);
    //display history view
    var template_html = new EJS({url: './templates/find_template.ejs'}).render({tabs:tabs, googles:googles, maplist:maplist});
    $('#stage').html(template_html);


    var searchtimeout = window.setTimeout(null, 800);


    $("#recentsearch").keyup(function(){
      window.clearTimeout(searchtimeout);//for fast typing
      searchtimeout = window.setTimeout(function(){
        $("#domainlist").html('');
        var text=$("#recentsearch").val();
        search_history(text, function(results){
          var html='';
          for(var i in results){
            html+='<tr><td>'
            html+='<a href="'+results[i].url+'">'+results[i].title+'</a>'
            html+='</td></tr>'
          }
          $("#domainlist").html(html);
        })
      },800);

    })

    $("#recentsearch").focus();


  })

}





function search_history(text, callback){
 var days=2;
 d = new Date();
 var now=d.getTime();
 var hours=d.getHours();
 if(hours<5){      //make the day start at 5am
  d.setDate(d.getDate()-1);
}
d.setHours(5);
console.log('from = '+d.getHours()+'    day='+ d.getDate());
var from=d.getTime();

chrome.history.search({text:text, startTime:from, endTime:now, maxResults:10}, function(tabs){

  console.log(tabs.length +' history results');
  callback(tabs);
});
}

function list_maps(tabs){
  console.log(tabs)
  //get the google maps visits
  var maplist=[];
  for(var i in tabs){
    for(var o in tabs[i].sites){
     if(tabs[i].sites[o].url.match(/^https?:\/\/maps\.google\./)){
       var parsed=parseUri(tabs[i].sites[o].url);
       var q=parsed.queryKey.q;
       q=decodeURI(q);
       q=q.replace(/\+/g,' ');
       var zoom=parsed.queryKey.z;
       var image='http://maps.googleapis.com/maps/api/staticmap?center='+q+'&zoom='+zoom+'&size=200x200&maptype=roadmap&sensor=false'
       maplist.push({url:tabs[i].url, image:image, q:q});
     }
   }
 }
 return maplist;
}

//get google searches
function list_googles(tabs){
  searches=[]
  for(var i in tabs){
    for(var o in tabs[i].sites){
     if(tabs[i].sites[o].url.match(/google\..*?\/search/)){
       var parsed=parseUri(tabs[i].sites[o].url);
       var q=parsed.queryKey.q;
       q=decodeURI(q);
       if(q){
        q=q.replace(/\+/g,' ');
        searches.push(q);
      }
    }
  }
}
searches=unique(searches);

//get common terms
var tokens={};
for(var i in searches){
  var chunks=searches[i].split(' ');
  for(var o in chunks){
    if(!tokens[chunks[o]]){
      tokens[chunks[o]]=0;
    }
    tokens[chunks[o]]++
  }
}

//convert to array
var grams=[];
for(var i in tokens){
  grams.push({gram:i, count:tokens[i]})
}
grams=grams.sort(function(a,b){return b.count-a.count;})
grams=_.select(grams,function(g){return g.count>1;})
console.log(grams)

//augment searches with terms
for(var i in searches){
 var show=searches[i];
 o:for(var o in grams){
  if(show.match(grams[o].gram)){
    var newterm='<b style="font-size:18px;">'+grams[o].gram+'</b>';
    var reg=new RegExp('\\b'+grams[o].gram+'\\b');
    show=show.replace(reg, newterm)
    continue o;
  }
}
searches[i]={show:show, q:searches[i]};
}
return searches;
}

