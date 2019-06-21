window.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* global Chart, workerScriptWraper */

  const canv = document.getElementById('canv-chart');
  const ctx = canv.getContext('2d');


  // Based on: https://github.com/chartjs/Chart.js/issues/2830#issuecomment-227867969
  Chart.plugins.register({
    beforeDraw: (chartInstance) => {
      // Add opaque background color to a plot
      const { chart } = chartInstance;
      chart.ctx.fillStyle = 'black';
      chart.ctx.fillRect(0, 0, chart.width, chart.height);
    }
  });


  function drawMissingDataMessage() {

    const { width, height } = canv;
    const centerX = width / 2 >> 0;
    const centerY = height / 2 >> 0;
    const message = 'Data cannot be retrieved';

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'red';
    ctx.font = '25px Courier bold';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillText(message, centerX, centerY);
  }


  function drawChart({ names, gdp, summary }) {

    const baseColor = 'darkgray';
    const verticalAxisId = 'vax-countries';
    const horizontalAxisId = 'hax-gdp';

    const config = {

      type: 'horizontalBar',

      data: {
        labels: names,
        datasets: [{
          yAxisID: verticalAxisId,
          label: '',
          data: gdp,
          backgroundColor: baseColor,
          borderColor: baseColor,
          borderWidth: 0,
          hoverBackgroundColor: 'dodgerblue',
          hoverBorderColor: 'dodgerblue',
          hoverBorderWidth: 0
        }]
      },

      options: {

        responsive: false,

        animation: {
          duration: 1000,
          easing: 'easeInOutQuint',
          onComplete: (chartAnimationInstance) => {

            const { canvas } = chartAnimationInstance.chart;
            const aButton = document.createElement('a');

            aButton.role = 'button';
            aButton.download = 'chart.png';
            aButton.id = 'save-canv';
            aButton.textContent = 'Save chart image';

            // Fixed link is sufficient because data and chart are static
            aButton.href = canvas.toDataURL('image/png;base64');

            canvas.insertAdjacentElement('afterend', aButton);

            // Ensure it runs only once
            chartAnimationInstance.chart.config.options.animation.onComplete = null;
          }
        },

        layout: {
          padding: 20
        },

        legend: {
          display: false,
          position: 'top',
          fullWidth: true,
          labels: {
            fontSize: 14,
            fontStyle: 'normal',
            fontColor: baseColor,
            padding: 12
          }
        },

        title: {
          display: true,
          position: 'top',
          fontSize: 24,
          fontColor: baseColor,
          fontStyle: 'bold',
          padding: 12,
          text: summary.title.split('\n')
        },

        tooltips: {
          enabled: false
        },

        scales: {

          yAxes: [{
            display: true,
            id: verticalAxisId,
            type: 'category',
            position: 'left',
            offset: true,
            stacked: false,
            barPercentage: 0.9,
            categoryPercentage: 0.8,
            gridLines: {
              display: false,
              offsetGridLines: true
            }
          }],

          xAxes: [{
            display: true,
            id: horizontalAxisId,
            type: 'linear',
            position: 'bottom',
            offset: false,
            stacked: false,
            gridLines: {
              display: true,
              color: 'rgba(90, 90, 90, 0.3)',
              lineWidth: 1,
              drawBorder: true,
              drawOnChartArea: true,
              drawTicks: true,
              zeroLineWidth: 1,
              zeroLineColor: 'rgba(90, 90, 90, 0.3)',
              offsetGridLines: false
            },
            ticks: {
              beginAtZero: true,
              min: 0,
              max: 270,
              maxTicksLimit: 10,
              stepSize: 25
            }
          }]
        },

        annotation: {
          annotations: [{
            drawTime: 'afterDatasetsDraw',
            id: 'avg-gdp-line',
            type: 'line',
            mode: 'vertical',
            scaleID: horizontalAxisId,
            value: summary.mean,
            borderColor: 'red',
            borderWidth: 2,
            borderDash: [12, 10],
            borderDashOffset: 0,
            label: {
              backgroundColor: 'rgba(0,0,0,0.3)',
              fontSize: 12,
              fontStyle: 'normal',
              fontColor: 'red',
              xPadding: 4,
              yPadding: 4,
              cornerRadius: 0,
              position: 'bottom',
              xAdjust: -32,
              yAdjust: 14,
              enabled: true,
              content: `Avg.: ${summary.mean.toFixed(0)}`
            }
          }]
        }
      }

    };

    return new Chart(ctx, config);
  }


  // Based on: https://stackoverflow.com/a/33432215
  const localWorkerFileWorkaround = new Blob(
    [`(${workerScriptWraper.toString()})()`], // Immediately Invoked Function Expression
    { type: 'text/javascript' }
  );

  let dataWorker = new Worker(URL.createObjectURL(localWorkerFileWorkaround));

  dataWorker.onmessage = (msg) => {

    if (msg.data === null) {
      drawMissingDataMessage();
    } else {
      drawChart(msg.data);
    }

    dataWorker.terminate();
    dataWorker = undefined;
  };


  dataWorker.postMessage(null);
}, {
  capture: false,
  once: true,
  passive: true
});
