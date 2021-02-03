window.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* global Chart, workerScriptWraper */

  const canv = document.getElementById('canv-chart');
  const ctx = canv.getContext('2d');


  // Based on: https://github.com/chartjs/Chart.js/issues/2830#issuecomment-227867969
  Chart.plugins.register({
    beforeDraw: ({ chart }) => {
      // Add opaque background color to a plot
      chart.ctx.fillStyle = '#000';
      chart.ctx.fillRect(0, 0, chart.width, chart.height);
    }
  });


  function drawMessage(message, fontColor) {

    // message -- string, short text that will be displayed on the canvas
    // fontColor -- string, must be valid CSS color

    const { width, height } = canv;
    const centerX = width / 2 >> 0;
    const centerY = height / 2 >> 0;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = fontColor;
    ctx.font = '25px Courier bold';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillText(message, centerX, centerY);
  }


  function drawChart({ names, gdp, summary }) {

    const baseColor = '#aaa';
    const verticalAxisId = 'vax-countries';
    const horizontalAxisId = 'hax-gdp';

    const barChartOptions = {

      type: 'horizontalBar',

      data: {
        labels: names,
        datasets: [{
          yAxisID: verticalAxisId,
          label: '',
          data: gdp,
          barPercentage: 0.9,
          categoryPercentage: 0.8,
          backgroundColor: baseColor,
          borderColor: baseColor,
          borderWidth: 0,
          hoverBackgroundColor: '#1e90ff',
          hoverBorderColor: '#1e90ff',
          hoverBorderWidth: 0
        }]
      },

      options: {

        responsive: false,

        animation: {
          duration: 1000,
          easing: 'easeInOutQuint',
          onComplete: ({ chart: { canvas, config } }) => {

            const aButton = document.createElement('a');

            aButton.role = 'button';
            aButton.download = 'chart.png';
            aButton.id = 'save-canv';
            aButton.textContent = 'Save chart image';

            // Fixed link is sufficient because data and chart are static
            aButton.href = canvas.toDataURL('image/png;base64');

            canvas.insertAdjacentElement('afterend', aButton);

            // Ensure it runs only once
            config.options.animation.onComplete = null;
          }
        },

        hover: {
          animationDuration: 0
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
              color: '#333',
              lineWidth: 1,
              drawBorder: true,
              drawOnChartArea: true,
              drawTicks: true,
              zeroLineWidth: 1,
              zeroLineColor: '#333',
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
            borderColor: '#c00',
            borderWidth: 2,
            borderDash: [12, 10],
            borderDashOffset: 0,
            label: {
              backgroundColor: 'rgba(0,0,0,0.3)',
              fontSize: 12,
              fontStyle: 'normal',
              fontColor: '#c00',
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

    return new Chart(ctx, barChartOptions);
  }


  // Based on: https://stackoverflow.com/a/33432215
  const localWorkerFileWorkaround = new Blob(
    [`(${workerScriptWraper.toString()})()`], // Immediately Invoked Function Expression
    { type: 'text/javascript' }
  );

  let dataWorker = new Worker(URL.createObjectURL(localWorkerFileWorkaround));

  dataWorker.onmessage = ({ data }) => {
    if (data === null) {
      drawMessage('Data cannot be retrieved', '#c00');
    } else {
      drawChart(data);
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
