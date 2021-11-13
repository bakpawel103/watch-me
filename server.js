const express = require('express');
const app = express();
const port = process.env.PORT || 8080;
const cons = require('consolidate');
const path = require('path');
const cors = require('cors');
const axios = require('axios');
const jsdom = require('jsdom');
const htmlElementStringify = require('html-element-stringify')

app.engine('html', cons.swig)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

app.use(cors({
    origin: '*'
}));

class Investment {
    constructor(name, currentValue, value1Day, value1Month, value3Months, value1Year) {
        this.name = name;
        this.currentValue = currentValue;
        this.value1Day = value1Day;
        this.value1Month = value1Month;
        this.value3Months = value3Months;
        this.value1Year = value1Year;
    }
}

app.get('/', (req, res) => {
    let investments = [];

    axios({
        method: 'get',
        url: 'https://www.analizy.pl/fundusze-inwestycyjne-otwarte/notowania?&firmaZarz[]=TFIPCS&jednPodst=1&page=1&show_promoted=0&limit=50&',
        headers: {
            'Content-Type': 'application/text'
        }
    }).then((response) => {
        const dom = new jsdom.JSDOM(response.data);
        const investmentsElements = dom.window.document.getElementById('fundsQuotationsContainer');
        console.log(investmentsElements.childElementCount);
        for(let investmentIndex = 0; investmentIndex < investmentsElements.childElementCount; investmentIndex++) {
            let investmentToAdd = new Investment();
            investmentToAdd.name = investmentsElements.children[investmentIndex].getElementsByClassName('productName')[0].innerHTML;
            investmentToAdd.currentValue = investmentsElements.children[investmentIndex].getElementsByClassName('fundUnitValue')[0].getElementsByClassName('primaryContent')[0].getElementsByClassName('productBigText')[0].innerHTML;
            investmentToAdd.value1Day = investmentsElements.children[investmentIndex].getElementsByClassName('fundValue1D')[0].getElementsByClassName('primaryContent')[0].getElementsByClassName('productBigText')[0].innerHTML;
            investmentToAdd.value1Month = investmentsElements.children[investmentIndex].getElementsByClassName('fundValue1M')[0].getElementsByClassName('primaryContent')[0].getElementsByClassName('productBigText')[0].innerHTML;
            investmentToAdd.value3Months = investmentsElements.children[investmentIndex].getElementsByClassName('fundValue3M')[0].getElementsByClassName('primaryContent')[0].getElementsByClassName('productBigText')[0].innerHTML;
            investmentToAdd.value1Year = investmentsElements.children[investmentIndex].getElementsByClassName('fundValue12M')[0].getElementsByClassName('primaryContent')[0].getElementsByClassName('productBigText')[0].innerHTML;

            investments.push(investmentToAdd);
        }

        let html = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Watch me</title>
    <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
    <style>
    table, td, th {
      border: 1px solid black;
    }
    
    table {
      border-collapse: collapse;
      width: 100%;
    }
    
    td {
      text-align: center;
    }
    </style>
  </head>
  <body>
    <div class="container">
      <label for="investment-search">Search for investment:</label>
      <input type="search" id="investment-search" />
      <button value="Search" style="color: black">Search</button>
      <table>
        <tr>
          <th>L.p.</th>
          <th>Name</th>
          <th>Current value</th>
          <th>Value 1 day ago</th>
          <th>Value 1 month ago</th>
          <th>Value 3 months ago</th>
          <th>Value 1 year ago</th>
        </tr>
        ${
            investments.map((item, i) => `
                <tr><td>${i}
                </td><td>${item.name}
                </td><td>${item.currentValue}
                </td><td>${item.value1Day}
                </td><td>${item.value1Month}
                </td><td>${item.value3Months}
                </td><td>${item.value1Year}</td></tr>
            `.trim()).join('')
            }
      </table>
    </div>
  </body>
</html>`;

        res.send(html)
    });
});

app.get('/getInvestment', (req, res) => {

})

app.listen(port, function () {
    console.log('Our app is running on http://localhost:' + port);
});
