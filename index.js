// ==UserScript==
// @name         Better Kinvo
// @namespace    https://github.com/raulpesilva/twitch-auto-get-chest
// @version      0.1
// @description  auto get chest on twitch stream
// @author       RaulPeSilva
// @match        https://app.kinvo.com.br/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';
  const INITIAL_TIMEOUT = 5000;
  const FILTER_PLACE_SELECTOR = '#root > div > div > main > section > div > section + section + section > div';
  const CONTAINER_STOCK_SELECTOR = '#root > div > div > main > section > div > section > div > div > div > div > div';
  const HEADER_STOCK_SELECTOR = '#root > div > div > header > div > div';

  function sortStocks(a, b) {
    return a == b ? 0 : a < b ? -1 : 1;
  }

  function sortStocksByValue(a, b) {
    return a == b ? 0 : a < b ? 1 : -1;
  }

  function applyCss(element, styles) {
    for (const style in styles) {
      element.style[style] = styles[style];
    }
  }

  function createButton(text, fn) {
    const $button = document.createElement('button');
    $button.textContent = text;
    applyCss($button, styles.button);
    $button.addEventListener('click', fn);

    return $button;
  }

  function getContainerStocks() {
    const $container = document.querySelector(CONTAINER_STOCK_SELECTOR);
    return $container;
  }

  function getStocks() {
    const $container = getContainerStocks();
    const $stocks = [...$container.querySelectorAll('section')];
    return $stocks;
  }

  function filterByName() {
    const $container = getContainerStocks();
    const $stocks = getStocks();
    const newOrderStocks = $stocks.sort((a, b) =>
      sortStocks(a.querySelector('.col-4').textContent, b.querySelector('.col-4').textContent)
    );
    $container.innerHTML = '';
    newOrderStocks.map((newStock) => $container.appendChild(newStock));
  }

  function onlyNumbers(value) {
    return Number(value.replace(/\D/g, ''));
  }

  function filterByValue() {
    const $container = getContainerStocks();
    const $stocks = getStocks();
    const newOrderStocks = $stocks.sort((a, b) =>
      sortStocksByValue(
        onlyNumbers(a.querySelector('.col-3').textContent),
        onlyNumbers(b.querySelector('.col-3').textContent)
      )
    );
    $container.innerHTML = '';
    newOrderStocks.map((newStock) => $container.appendChild(newStock));
  }

  function filterByPercentage() {
    const $container = getContainerStocks();
    const $stocks = getStocks();
    const newOrderStocks = $stocks.sort((a, b) =>
      sortStocksByValue(
        onlyNumbers(a.querySelector('.col-2').textContent),
        onlyNumbers(b.querySelector('.col-2').textContent)
      )
    );
    $container.innerHTML = '';
    newOrderStocks.map((newStock) => $container.appendChild(newStock));
  }

  function filterByPercentageWallet() {
    const $container = getContainerStocks();
    const $stocks = getStocks();
    const newOrderStocks = $stocks.sort((a, b) =>
      sortStocksByValue(
        onlyNumbers(a.querySelectorAll('.col-2')[1].textContent),
        onlyNumbers(b.querySelectorAll('.col-2')[1].textContent)
      )
    );
    $container.innerHTML = '';
    newOrderStocks.map((newStock) => $container.appendChild(newStock));
  }

  function createFilterSection() {
    const $header = document.querySelector(HEADER_STOCK_SELECTOR);
    const $profit = $header.querySelector('div').cloneNode(true);
    console.log($profit);
    const $container = document.querySelector(FILTER_PLACE_SELECTOR);

    const $buttonFilterByName = createButton('Nome', filterByName);
    const $buttonFilterByValue = createButton('Saldo Atual', filterByValue);
    const $buttonFilterByPercentage = createButton('Rentabilidade', filterByPercentage);
    const $buttonFilterByPercentageWallet = createButton('Carteira', filterByPercentageWallet);

    const $wrapperButtons = document.createElement('div');
    applyCss($wrapperButtons, styles.wrapperButtons);

    $wrapperButtons.appendChild($buttonFilterByName);
    $wrapperButtons.appendChild($buttonFilterByValue);
    $wrapperButtons.appendChild($buttonFilterByPercentage);
    $wrapperButtons.appendChild($buttonFilterByPercentageWallet);
    $wrapperButtons.id = 'better-kinvo-place';

    if (!$container) return;
    $container.prepend($wrapperButtons);
  }

  function onPageChange() {
    const buttonAlreadyExists = document.querySelector('#better-kinvo-place');
    if (buttonAlreadyExists) return;

    createFilterSection();
  }

  function init() {
    setTimeout(onPageChange, INITIAL_TIMEOUT);
    window.addEventListener('mousemove', onPageChange);
  }

  init();
})();

const styles = {
  button: {
    width: '24%',
    height: '40px',
    borderRadius: '8px',
    border: 'none',
    fontWeight: 'bold',
    color: 'rgb(98, 113, 121)',
    backgroundColor: 'rgb(218, 224, 227)',
    cursor: 'pointer',
  },
  wrapperButtons: {
    display: 'flex',
    width: '100%',
    justifyContent: 'space-between',
  },
};
