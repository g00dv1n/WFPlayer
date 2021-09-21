var $audio = document.querySelector('.audio');
var $version = document.querySelector('.version');
var $open = document.querySelector('.open');
var $download = document.querySelector('.download');
var $log = document.querySelector('.log');
var $scrollable = document.querySelector('.scrollable');
var $pickers = Array.from(document.querySelectorAll('.color-picker'));
var $range = Array.from(document.querySelectorAll('.range input'));

$version.innerHTML = 'Beta ' + WFPlayer.version;

var wf = null;
function initWFPlayer(url, duration) {
    if (wf) wf.destroy();

    wf = new WFPlayer({
        container: null,
        width: 1500,
        height: 500,
        shadowCanvas: true,
        scrollable: false,
        ruler: false,
        cursor: false,
        progress: false,
        grid: false,
        padding: 0,
        backgroundColor: 'rgba(0,0,20,255)',
        waveColor: {
            startColor: '#793aab',
            endColor: '#7ac4bf'
        },
        waveScale: 1,
        duration: duration,
    });

    wf.load(url)

    wf.on('finish', () => {
        console.log('finish')
        wf.exportImageAsBlob()
        .then(blob => {

            var newImg = document.getElementById('img-render')
            url = URL.createObjectURL(blob);

            newImg.onload = function() {
            // no longer need to read the blob so it's revoked
            URL.revokeObjectURL(url);
            };

            newImg.src = url;
        })
    })
}

initWFPlayer('/audio2.m4a', 3);

$download.addEventListener('click', function () {
    wf.exportImage();
});

$scrollable.addEventListener('change', function () {
    wf.setOptions({
        scrollable: $scrollable.checked,
    });
});

$pickers.forEach(function ($el) {
    var name = $el.getAttribute('name');
    var pickr = Pickr.create({
        el: $el,
        theme: 'classic',
        default: wf.options[name],
        swatches: [
            'rgba(244, 67, 54, 1)',
            'rgba(233, 30, 99, 0.95)',
            'rgba(156, 39, 176, 0.9)',
            'rgba(103, 58, 183, 0.85)',
            'rgba(63, 81, 181, 0.8)',
            'rgba(33, 150, 243, 0.75)',
            'rgba(3, 169, 244, 0.7)',
            'rgba(0, 188, 212, 0.7)',
            'rgba(0, 150, 136, 0.75)',
            'rgba(76, 175, 80, 0.8)',
            'rgba(139, 195, 74, 0.85)',
            'rgba(205, 220, 57, 0.9)',
            'rgba(255, 235, 59, 0.95)',
            'rgba(255, 193, 7, 1)',
        ],
        components: {
            preview: true,
            opacity: true,
            hue: true,
            interaction: {
                hex: true,
                rgba: true,
                input: true,
                save: true,
            },
        },
    });
    pickr
        .on('save', function (color) {
            wf.setOptions({
                [name]: color.toRGBA().toString(),
            });
            pickr.hide();
        })
        .on('change', function (color) {
            wf.setOptions({
                [name]: color.toRGBA().toString(),
            });
        });
});

$range.forEach(function ($el) {
    var name = $el.getAttribute('name');
    var min = Number($el.getAttribute('min'));
    var max = Number($el.getAttribute('max'));
    var step = Number($el.getAttribute('step'));
    new Powerange($el, {
        start: $el.value,
        min: min || 1,
        max: max || 20,
        step: step || 1,
        hideRange: true,
        decimal: true,
    });
    $el.onchange = function () {
        $el.previousElementSibling.innerHTML = $el.value;
        wf.setOptions({
            [name]: name === 'waveScale' ? Number($el.value) : Math.floor(Number($el.value)),
        });
    };
});


