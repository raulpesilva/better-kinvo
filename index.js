// ==UserScript==
// @name         Better Kinvo
// @namespace    https://github.com/raulpesilva/better-kinvo
// @version      0.2
// @description  add filter and profit
// @author       RaulPeSilva
// @match        https://app.kinvo.com.br/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';
  const INITIAL_TIMEOUT = 2000;
  const FILTER_PLACE_SELECTOR = '#root > div > div > main > section > div > section + section + section > div';
  const CONTAINER_STOCK_SELECTOR = '#root > div > div > main > section > div > section > div > div > div > div > div';
  const HEADER_STOCK_SELECTOR = '#root > div > div > header > div > div';
  const ID_BALANCE = 'better-kinvo-balance';
  const ID_FILTER = 'better-kinvo-place';

  function sortStocks(a, b) {
    return a == b ? 0 : a < b ? -1 : 1;
  }

  function sortStocksByValue(a, b) {
    return a == b ? 0 : a < b ? 1 : -1;
  }

  async function getContainerStocks() {
    const $container = await awaitElement(CONTAINER_STOCK_SELECTOR);
    return $container;
  }

  async function getStocks() {
    const $container = await getContainerStocks();
    const $stocks = [...$container.querySelectorAll('section')];
    return $stocks;
  }

  async function filter(filterFn) {
    const $container = await getContainerStocks();
    const $stocks = await getStocks();
    const newOrderStocks = $stocks.sort(filterFn);
    $container.innerHTML = '';
    newOrderStocks.map((newStock) => $container.appendChild(newStock));
  }

  async function filterByName() {
    await filter((a, b) => sortStocks(a.querySelector('.col-4').textContent, b.querySelector('.col-4').textContent));
  }

  async function filterByValue() {
    await filter((a, b) =>
      sortStocksByValue(
        onlyNumbers(a.querySelector('.col-3').textContent),
        onlyNumbers(b.querySelector('.col-3').textContent)
      )
    );
  }

  async function filterByPercentage() {
    await filter((a, b) =>
      sortStocksByValue(
        onlyNumbers(a.querySelector('.col-2').textContent),
        onlyNumbers(b.querySelector('.col-2').textContent)
      )
    );
  }

  async function filterByPercentageWallet() {
    await filter((a, b) =>
      sortStocksByValue(
        onlyNumbers(a.querySelectorAll('.col-2')[1].textContent),
        onlyNumbers(b.querySelectorAll('.col-2')[1].textContent)
      )
    );
  }

  async function createHeader() {
    const $header = await awaitElement(HEADER_STOCK_SELECTOR);
    $header.style.gridTemplateColumns = 'auto auto auto auto';
    const $stats = $header.querySelectorAll('div');
    const $profit = $stats[0].cloneNode(true);
    const balance = onlyNumbers($stats[0].textContent);
    const value = onlyNumbers($stats[5].textContent);
    const $title = $profit.querySelectorAll('div')[2];
    const $value = $profit.querySelectorAll('div')[3];
    $profit.id = ID_BALANCE;
    if ($title && $value) {
      $value.textContent = Intl.NumberFormat('pt-BR', { currency: 'brl', style: 'currency' }).format(
        (balance - value) / 100
      );
      $title.textContent = 'Lucro';
    }

    $header.prepend($profit);
  }

  async function createFilterSection() {
    const $container = await awaitElement(FILTER_PLACE_SELECTOR);

    const $buttonFilterByName = createButton('Nome', filterByName);
    const $buttonFilterByValue = createButton('Saldo Atual', filterByValue);
    const $buttonFilterByPercentage = createButton('Rentabilidade', filterByPercentage);
    const $buttonFilterByPercentageWallet = createButton('Carteira', filterByPercentageWallet);

    const $wrapperButtons = document.createElement('div');
    $wrapperButtons.classList.add('bk-wrapper-buttons');

    $wrapperButtons.appendChild($buttonFilterByName);
    $wrapperButtons.appendChild($buttonFilterByValue);
    $wrapperButtons.appendChild($buttonFilterByPercentage);
    $wrapperButtons.appendChild($buttonFilterByPercentageWallet);
    $wrapperButtons.id = ID_FILTER;

    if (!$container) return;
    $container.prepend($wrapperButtons);
  }

  async function onPageChange() {
    const buttonAlreadyExists = document.querySelector(`#${ID_FILTER}`);
    const balanceAlreadyExists = document.querySelector(`#${ID_BALANCE}`);
    if (!buttonAlreadyExists) await createFilterSection();
    if (!balanceAlreadyExists) await createHeader();
  }

  function init() {
    setTimeout(onPageChange, INITIAL_TIMEOUT);
    // window.addEventListener('mousemove', onPageChange);
  }

  observeDomChanges(init);
  applyCss();
  init();
})();

function css(styles, ...values) {
  return styles.reduce((style, currentStyle, i) => `${style}${currentStyle}${values[i] ? values[i] : ''}`, '');
}

function createButton(text, fn) {
  const $button = document.createElement('button');
  $button.textContent = text;
  $button.classList.add('bk-button');
  $button.addEventListener('click', fn);

  return $button;
}

function onlyNumbers(value) {
  return Number(value.replace(/[^0-9-]/gm, ''));
}

function observeDomChanges(callback) {
  let currentUrl = document.location.href;

  function locationChange() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(() => {
        if (currentUrl !== document.location.href) {
          currentUrl = document.location.href;
          callback(10);
          console.log('chamou');
        }
      });
    });
    const target = document.body;
    const config = { childList: true, subtree: true };
    observer.observe(target, config);
  }
  locationChange();
}

async function awaitElement(selector) {
  const MAX_TRIES = 60;
  let tries = 0;
  return new Promise((resolve, reject) => {
    function probe() {
      tries++;
      return document.querySelector(selector);
    }

    function delayedProbe() {
      if (tries >= MAX_TRIES) {
        console.log("Can't find element with selector", selector);
        reject();
        return;
      }
      const elm = probe();
      if (elm) {
        resolve(elm);
        return;
      }

      window.setTimeout(delayedProbe, 250);
    }

    delayedProbe();
  });
}

function applyCss() {
  const styles = css`
    .bk-button {
      width: 24%;
      height: 40px;
      border-radius: 8px;
      border: none;
      font-weight: bold;
      color: rgb(98, 113, 121);
      background-color: rgb(218, 224, 227);
    }

    .bk-button:hover {
      background-color: rgb(200, 200, 207);
      cursor: pointer;
    }

    .bk-wrapper-buttons {
      display: flex;
      width: 100%;
      justify-content: space-between;
    }
  `;
  const $style = document.createElement('style');
  $style.innerHTML = styles;
  $style.id = 'bk-styles';
  document.head.appendChild($style);
}
