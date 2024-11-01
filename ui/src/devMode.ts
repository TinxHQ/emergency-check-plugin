const addToolbar = () => {
  const div  = document.createElement('div');
  div.classList.add("plugin-toolbar");

  // @todo add icons
  // @todo add HOME icon => reload to plugin home page
  div.innerHTML = `
    <div class="plugin-toolbar-content">
      <button class="plugin-reload">Reload</button>
      <input type="text" class="plugin-url" placeholder="Enter URL" value="${window.location.href}" />
      <button class="plugin-collapse">Collapse</button>
    </div>
    <button class="plugin-collapse">Open</button>
  `;

  document.body.appendChild(div);

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
      window.location.href = e.currentTarget.value;
    }
  });
}

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
      transition: 150ms all ease;
      border-radius: 50px;
      background: #000;
      color: #FFF;
      display: inline-block;
      border: none;
      padding: 5px 10px;
      font-size: 14px;
      cursor: pointer;
    }

    .plugin-toolbar button:hover, .plugin-toolbar button:active {
      background: #FFF;
      color: #000;
    }

    .plugin-url {
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
      background: #333;
    }
  `

  document.head.appendChild(style);
}

const devMode = () => {
  addInlineStyles();
  addToolbar();
}


export default devMode;
