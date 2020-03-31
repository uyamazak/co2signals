const db = firebase.firestore()
const LOCATION = 'home';
const DOCS_QUERY_LIMIT = 180;
/* https://zukucode.com/2017/04/javascript-date-format.html */
function formatDate(date, format) {
  format = format.replace(/yyyy/g, date.getFullYear());
  format = format.replace(/MM/g, ('0' + (date.getMonth() + 1)).slice(-2));
  format = format.replace(/dd/g, ('0' + date.getDate()).slice(-2));
  format = format.replace(/HH/g, ('0' + date.getHours()).slice(-2));
  format = format.replace(/mm/g, ('0' + date.getMinutes()).slice(-2));
  format = format.replace(/ss/g, ('0' + date.getSeconds()).slice(-2));
  format = format.replace(/SSS/g, ('00' + date.getMilliseconds()).slice(-3));
  return format;
};
const app = new Vue({
  el: '#app',
  mixins: [VueChartJs.Line, VueChartJs.mixins],
  data: {
    chartdata: {},
    date: [],
    co2: [],
    temp: [],
  },
  computed: {
    co2DocsRef: function () {
      return db.collection(`/${LOCATION}/`)
    }
  },
  methods: {
    getSnapshot: function (callback) {
      let query = this.co2DocsRef
        .limit(DOCS_QUERY_LIMIT)
        .orderBy('timestamp', 'desc')
      return query.onSnapshot(callback)
    },
    updateCo2Docs: async function (snapshot) {
      this.co2 = []
      this.temp = []
      this.date = []
      await snapshot.docs.forEach(doc => {
        const data = doc.data();
        this.co2.unshift(data.co2)
        this.temp.unshift(data.temperature)
        this.date.unshift(formatDate(data.timestamp.toDate(), 'HH:mm'))
      });
      this.chartData = {
        labels: this.date,
        datasets: [
          {
            label: 'co2',
            fill: false,
            backgroundColor: '#f87979',
            data: this.co2,
            yAxisID: 'y-axis-1',
          },
          {
            label: 'temp',
            fill: false,
            backgroundColor: '#79f879',
            data: this.temp,
            yAxisID: 'y-axis-2',
          }
        ]
      };
      this.updateChart();
    },
    updateChart: function () {
      this.renderChart(this.chartData, {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          yAxes: [{
            type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
            display: true,
            position: 'right',
            id: 'y-axis-1',
          }, {
            type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
            display: true,
            position: 'left',
            id: 'y-axis-2',

            // grid line settings
            gridLines: {
              drawOnChartArea: true, // only want the grid lines for one axis to show up
            },
          }],
        }
      });
    }
  },
  mounted: function () {
    this.updateChart();
  },
  created: function () {
    this.getSnapshot(this.updateCo2Docs);
  }
});