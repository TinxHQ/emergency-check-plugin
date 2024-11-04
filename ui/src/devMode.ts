const HomeIcon = () =>
  `<svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="HomeIcon"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"></path></svg>`

const RefreshIcon = () =>
  `<svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="RefreshIcon"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4z"></path></svg>`

const CollapseIcon = () =>
  `<svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="CloseFullscreenIcon"><path d="M22 3.41 16.71 8.7 20 12h-8V4l3.29 3.29L20.59 2zM3.41 22l5.29-5.29L12 20v-8H4l3.29 3.29L2 20.59z"></path></svg>`

const OpenIcon = () =>
  `<svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="OpenInFullIcon"><path d="M21 11V3h-8l3.29 3.29-10 10L3 13v8h8l-3.29-3.29 10-10z"></path></svg>`

const addToolbar = () => {
  const div  = document.createElement('div');
  div.classList.add("plugin-toolbar");

  // @todo add URL listener
  div.innerHTML = `
    <div class="plugin-toolbar-content">
      <!-- <button class="plugin-home">${HomeIcon()}</button> -->
      <button class="plugin-reload">${RefreshIcon()}</button>
      <input type="text" class="plugin-url" placeholder="Enter URL" value="${window.location.href}" />
      <button class="plugin-collapse">${CollapseIcon()}</button>
    </div>
    <button class="plugin-collapse">${OpenIcon()}</button>
  `;

  document.body.appendChild(div);

  // @todo missing information from SDK or apps to get the original URL, blocked by iframe cross-domain
  document.querySelector('.plugin-home')?.addEventListener('click', () => {
    window.history.go(0);
  });

  document.querySelector('.plugin-reload')?.addEventListener('click', () => {
    window.location.reload();
  });

  const pluginCollapseElements = document.querySelectorAll('.plugin-collapse');

  pluginCollapseElements.forEach(element => {
    element.addEventListener('click', () => {
      document.querySelector('.plugin-toolbar')?.classList.toggle('close');
    });
  });

  document.querySelector('.plugin-url')?.addEventListener('keypress', (e: KeyboardEvent) => {
    if (e?.key === 'Enter') {
      window.location.href = (e.currentTarget as HTMLInputElement).value;
    }
  });
};

const addInlineStyles = () => {
  const style = document.createElement('style');
  style.innerText = `
    .plugin-toolbar {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      background-color: rgba(0,0,0,.5);
      padding: 10px;
      box-sizing: border-box;
      color: #FFF;
      z-index: 9999;
    }

    .plugin-toolbar.close {
      width: fit-content;
      border-radius: 0 0 5px 0;
    }

    .plugin-toolbar.close > .plugin-collapse {
      display: inline-block;
    }

    .plugin-toolbar.close .plugin-toolbar-content {
      display: none;
    }

    .plugin-toolbar > .plugin-collapse {
      display: none;
    }

    .plugin-toolbar .plugin-toolbar-content {
      display: flex;
      gap: 5px
    }

    .plugin-toolbar button {
      transition: 200ms all ease;
      border-radius: 50px;
      background: #000;
      color: #FFF;
      display: inline-block;
      border: none;
      padding: 5px 10px;
      font-size: 14px;
      cursor: pointer;
    }

    .plugin-toolbar button svg {
      transition: 200ms all ease;
      height: 20px;
      width: auto;
      display: inline-block;
      vertical-align: middle;
      fill: #FFF;
    }

    .plugin-toolbar button:hover, .plugin-toolbar button:active {
      background: #FFF;
      color: #000;
    }

    .plugin-toolbar button:hover svg, .plugin-toolbar button:active svg {
      fill: #000;
    }

    .plugin-url {
      transition: 200ms all ease;
      border-radius: 50px;
      background-color: #000;
      display: inline-block;
      padding: 5px 10px;
      font-size: 14px;
      width: 100%;
      border: none;
      outline: 0;
      color: #FFF;
      border: 1px solid #000;
    }

    .plugin-url:focus {
      background: #FFF;
      color: #000;
      border: 1px solid #333;
    }
  `

  document.head.appendChild(style);
}

const devMode = () => {
  addInlineStyles();
  addToolbar();
}


export default devMode;
