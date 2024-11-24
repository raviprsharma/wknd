export async function fetchForm(pathname) {
    // get the main form
    let data;
    let path = pathname;
    if (path.startsWith(window.location.origin) && !path.endsWith('.json')) {
      if (path.endsWith('.html')) {
        path = path.substring(0, path.lastIndexOf('.html'));
      }
      path += '/jcr:content/root/section/form.html';
    }
    let resp = await fetch(path);
  
    if (resp?.headers?.get('Content-Type')?.includes('application/json')) {
      data = await resp.json();
    } else if (resp?.headers?.get('Content-Type')?.includes('text/html')) {
      resp = await fetch(path);
      data = await resp.text().then((html) => {
        try {
          const doc = new DOMParser().parseFromString(html, 'text/html');
          if (doc) {
            return extractFormDefinition(doc.body).formDef;
          }
          return doc;
        } catch (e) {
          console.error('Unable to fetch form definition for path', pathname, path);
          return null;
        }
      });
    }
    return data;
  }


export default async function decorate(block) {
    let container = block.querySelector('a[href]');
    let formDef;
    let pathname;
    if (container) {
      ({ pathname } = new URL(container.href));
      formDef = await fetchForm(container.href);
    } else {
      ({ container, formDef } = extractFormDefinition(block));
    }

    let aritlceList ='';
    let inerElem = document.createElement('div');
    inerElem.className = 'list-container';
    if(formDef.data && formDef.data.length){
      formDef.data.map((res)=>{
        aritlceList+= `<div class="title"><span>${res.Id}: </span>${res.Title || res.title}</div>`
      })
    }
    // console.log(formDef)
    inerElem.innerHTML =aritlceList; 
    container.remove()
    block.append(inerElem);
  }
  