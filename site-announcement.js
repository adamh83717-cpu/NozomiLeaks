(function(){
  var path=(window.location.pathname||'/').toLowerCase();
  if(/^\/(signup|auth|internal|admin)(\/|$)/.test(path))return;
  fetch('/apisite/api/alerts/alert-info',{credentials:'same-origin'})
    .then(function(response){return response.ok?response.json():null})
    .then(function(alert){
      if(!alert||!alert.IsVisible||!alert.Text)return;
      var link=document.createElement('a');
      link.className='nozomi-site-announcement';
      link.href='https://discord.gg/PE7WjemyTC';
      link.target='_blank';
      link.rel='noreferrer';
      var text=document.createElement('span');
      text.textContent=alert.Text;
      link.appendChild(text);
      document.body.insertBefore(link,document.body.firstChild);
    })
    .catch(function(){});
})();
