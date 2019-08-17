window.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* eslint one-var: ["error", "consecutive"] */

  /*
   * Canvas digital clock from tutorial: https://www.youtube.com/watch?v=9dtDaWi6R0g
   *
   * Major changes:
   * -- utilizing ES6 features
   * -- some further optimization by moving more things outside animation update function
   * -- using requestAnimationFrame in lieu of setInterval
   * -- 24 hour clock format
   */

  const degToRad = (angle) => angle * Math.PI / 180, // eslint-disable-line no-mixed-operators
        canv = document.getElementById('canv-clock'),
        ctx = canv.getContext('2d'),
        centerX = canv.width / 2 >> 0,
        centerY = canv.height / 2 >> 0,
        startAngle = degToRad(270),
        baseColor = '#28d1fa';

  ctx.strokeStyle = baseColor;
  ctx.lineWidth = 17;
  ctx.lineCap = 'round';
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'center';
  ctx.shadowBlur = 15;
  ctx.shadowColor = baseColor;

  const gradient = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, 300);

  gradient.addColorStop(0, '#09303a');
  gradient.addColorStop(1, 'black');


  const renderClock = () => {

    const now = new Date(),
          today = now.toDateString(),
          time = now.toLocaleTimeString('en-US', { hour12: false }),
          hours = now.getHours(),
          minutes = now.getMinutes(),
          seconds = now.getSeconds(),
          miliseconds = now.getMilliseconds(),
          offsetAngle = 90;

    // BACKGROUND
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canv.width, canv.height);

    // HOURS: 360 degrees / 24 hours = 15 degrees / hour
    ctx.beginPath();
    ctx.arc(centerX, centerY, 200, startAngle, degToRad(hours * 15 - offsetAngle));
    ctx.stroke();

    // MINUTES: 360 degrees / 60 minutes = 6 degrees / minute
    ctx.beginPath();
    ctx.arc(centerX, centerY, 170, startAngle, degToRad(minutes * 6 - offsetAngle));
    ctx.stroke();

    // SECONDS: 360 degrees / 60 seconds = 6 degrees / second
    ctx.beginPath();
    ctx.arc(centerX, centerY, 140, startAngle, degToRad((seconds + miliseconds / 1000) * 6 - offsetAngle));
    ctx.stroke();

    // DATE
    ctx.fillStyle = baseColor;
    ctx.font = '25px Arial bold';
    ctx.fillText(today, centerX, 250);

    // TIME
    ctx.font = '15px Arial';
    ctx.fillText(time, centerX, 280);

    requestAnimationFrame(renderClock);
  };


  document.getElementById('save-canv').addEventListener('click', (evt) => {
    evt.target.href = canv.toDataURL('image/png;base64');
  }, {
    capture: false,
    once: false,
    passive: true
  });


  requestAnimationFrame(renderClock);
}, {
  capture: false,
  once: true,
  passive: true
});
