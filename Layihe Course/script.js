const apikey = '7ce80ff9c819a72a192158df';
const url = 'https://v6.exchangerate-api.com/v6';

const amountInput = document.querySelector('.amount');
const resultInput = document.querySelector('.result');
const currencyLabel = document.querySelector('.currency-label');
const exchangeLabel = document.querySelector('.exchange-label');
const header = document.querySelector('header');
const main = document.querySelector('main');
const errorContainer = document.querySelector('.error-container');

let fromValue = 'RUB';
let toValue = 'USD';

document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  convertCurrency();
});

window.addEventListener('offline', handleOfflineMode);

function setupEventListeners() {
  document.querySelector('.hamburger')?.addEventListener('click', toggleSidebar);

  document.querySelectorAll('.from').forEach((btn) =>
    btn.addEventListener('click', () => {
      updateSelection('.from', 'from-focused', btn);
      fromValue = btn.value;
      convertCurrency();
    })
  );

  document.querySelectorAll('.to').forEach((btn) =>
    btn.addEventListener('click', () => {
      updateSelection('.to', 'to-focused', btn);
      toValue = btn.value;
      convertCurrency();
    })
  );

  amountInput.addEventListener('input', () => {
    convertCurrency();
  });

  resultInput.addEventListener('input', () => {
    convertBackCurrency();
  });
}

function toggleSidebar() {
  const nav = document.querySelector('.nav') || document.querySelector('.side-bar');
  nav.classList.toggle('nav');
  nav.classList.toggle('side-bar');
}

function updateSelection(selector, focusClass, activeButton) {
  document.querySelectorAll(selector).forEach((btn) => btn.classList.remove(focusClass));
  activeButton.classList.add(focusClass);
}

async function convertCurrency() {
  const amount = parseFloat(amountInput.value.replace(',', '.')) || 0;

  if (fromValue === toValue) {
    displayEqualRates(amount);
    return;
  }

  try {
    const { conversion_rates } = await fetchExchangeRate(fromValue);
    const rate = conversion_rates[toValue];
    const result = amount * rate;

    resultInput.value = result.toFixed(4);
    updateRateLabels(rate);
  } catch (err) {
    console.error('Conversion error:', err);
    handleOfflineMode();
  }
}

async function convertBackCurrency() {
  const result = parseFloat(resultInput.value.replace(',', '.')) || 0;
  if (!result) {
    amountInput.value = '';
    return;
  }

  try {
    const { conversion_rates } = await fetchExchangeRate(toValue);
    const reverseRate = 1 / conversion_rates[fromValue];
    amountInput.value = (result * reverseRate).toFixed(4);
  } catch (err) {
    console.error('Reverse conversion error:', err);
  }
}

async function fetchExchangeRate(baseCurrency) {
  const response = await fetch(`${url}/${apikey}/latest/${baseCurrency}`);
  if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
  return response.json();
}

function updateRateLabels(rate) {
  currencyLabel.textContent = `1 ${fromValue} = ${rate.toFixed(4)} ${toValue}`;
  exchangeLabel.textContent = `1 ${toValue} = ${(1 / rate).toFixed(4)} ${fromValue}`;
}

function displayEqualRates(amount) {
  resultInput.value = amountInput.value || '0';
  currencyLabel.textContent = `1 ${fromValue} = 1 ${toValue}`;
  exchangeLabel.textContent = `1 ${toValue} = 1 ${fromValue}`;
}

function handleOfflineMode() {
  const offline = !navigator.onLine;
  errorContainer.style.display = offline ? 'flex' : 'none';
  header.style.display = offline ? 'none' : 'block';
  main.style.display = offline ? 'none' : 'block';
}

