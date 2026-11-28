// YouSpeak's landing page. Nothing is stored and nothing is sent: the stores' links, a shared Daily's link, the preview's
// pause key, and two demos that play the app's own audio from this site (a Band 9 answer with its words lit as they're
// spoken, P4 › The player; the Sound Lab's sheep / ship, P9 › The Sound Lab).
(function () {
    'use strict';
    var $ = function (id) { return document.getElementById(id); };
    var ua = navigator.userAgent;
    var android = /Android/i.test(ua);
    // an iPad's Safari sends a Mac's user agent; a touch screen tells them apart
    var ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
    var mac = !ios && /Macintosh/.test(ua);
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

    // ---- the visitor's store: one badge on a phone or tablet, both on a computer (the App Store's first, Apple's rule); a Mac
    // with Apple silicon runs the iPad app, so a Mac gets no "open this on your phone" line ----
    if (android) {
        $('badge-apple').classList.add('hidden');
        $('also-apple').classList.remove('hidden');
    } else if (ios) {
        $('badge-play').classList.add('hidden');
        $('also-play').classList.remove('hidden');
    } else if (!mac && !/Mobi/.test(ua)) {
        $('desktop').classList.remove('hidden');
    }

    // ---- a shared Daily's link (P10 › The link; the app's rules: ShareLink.kt) ----
    (function () {
        var query = new URLSearchParams(location.search);
        var daily = query.get('daily') || '';
        var idiom = query.get('idiom') || '';
        if (!/^\d{4}-\d{2}-\d{2}$/.test(daily)) return;
        var day = new Date(daily + 'T00:00:00Z');
        if (isNaN(day) || day.toISOString().slice(0, 10) !== daily) return;
        if (!/^idm-[a-z0-9]+(-[a-z0-9]+)*$/.test(idiom)) idiom = '';
        $('shared').classList.remove('hidden');
        if (android) {
            // Chrome's intent link opens the app when it's installed, Google Play when it isn't
            var link = 'principiaforge.com/youspeak/?daily=' + daily + (idiom ? '&idiom=' + idiom : '');
            var play = $('badge-play').href;
            var open = $('open-app');
            open.href = 'intent://' + link + '#Intent;scheme=https;package=com.principiaforge.ieltsspeaking;S.browser_fallback_url=' +
                encodeURIComponent(play) + ';end';
            open.classList.remove('hidden');
        }
    })();

    // ---- the preview loop: muted, with a key to pause it (WCAG 2.2.2); still when the visitor asks for less motion ----
    (function () {
        var video = $('preview');
        var key = $('preview-toggle');
        if (!video || !key) return;
        var heldByVisitor = reduce.matches;
        var sync = function () {
            var on = !video.paused;
            key.classList.toggle('playing', on);
            key.querySelector('span').textContent = on ? 'Pause the preview' : 'Play the preview';
        };
        video.addEventListener('play', sync);
        video.addEventListener('pause', sync);
        key.addEventListener('click', function () {
            if (video.paused) { heldByVisitor = false; video.play().catch(function () {}); } else { heldByVisitor = true; video.pause(); }
        });
        if ('IntersectionObserver' in window) {
            new IntersectionObserver(function (entries) {
                entries.forEach(function (e) {
                    if (e.isIntersecting && !heldByVisitor) video.play().catch(function () {});
                    if (!e.isIntersecting && !video.paused) video.pause();
                });
            }).observe(video);
        } else if (!heldByVisitor) {
            video.play().catch(function () {});
        }
        sync();
    })();

    // ---- the Band 9 answers ----
    (function () {
        var demo = document.querySelector('[data-demo="answers"]');
        if (!demo) return;
        var tabs = [].slice.call(demo.querySelectorAll('[role="tab"]'));
        var panels = [].slice.call(demo.querySelectorAll('.answer'));
        var audio = new Audio();
        audio.preload = 'none';
        var panel = null, words = [], starts = [], stages = [], frame = 0, lit = -1;

        var fmt = function (s) { s = Math.floor(s); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); };
        var key = function () { return panel.querySelector('.play'); };
        var setKey = function (on) {
            key().classList.toggle('playing', on);
            key().querySelector('span').textContent = on ? 'Pause' : 'Play';
            key().setAttribute('aria-label', on ? 'Pause the Band 9 answer' : 'Play the Band 9 answer');
        };
        var light = function (ms) {
            // the lit word is the last one that has started (LipSync.kt › captionIndexAt); it stays lit until the next begins
            var lo = 0, hi = starts.length - 1, at = -1;
            while (lo <= hi) { var mid = (lo + hi) >> 1; if (starts[mid] <= ms) { at = mid; lo = mid + 1; } else { hi = mid - 1; } }
            if (at !== lit) {
                if (lit >= 0) { words[lit].classList.remove('on'); words[lit].parentNode.classList.remove('on'); }
                if (at >= 0) { words[at].classList.add('on'); words[at].parentNode.classList.add('on'); }
                lit = at;
            }
            stages.forEach(function (b) { b.classList.toggle('on', ms >= +b.dataset.from && ms <= +b.dataset.to); });
            var total = +panel.dataset.ms;
            panel.querySelector('.fill').style.width = Math.min(100, (ms / total) * 100) + '%';
            panel.querySelector('.now').textContent = fmt(ms / 1000);
        };
        var tick = function () { settle(); light(audio.currentTime * 1000); frame = requestAnimationFrame(tick); };
        var reset = function () {
            cancelAnimationFrame(frame);
            if (lit >= 0) { words[lit].classList.remove('on'); words[lit].parentNode.classList.remove('on'); }
            lit = -1;
            stages.forEach(function (b) { b.classList.remove('on'); });
            panel.querySelector('.fill').style.width = '0';
            panel.querySelector('.now').textContent = '0:00';
            setKey(false);
        };
        var select = function (p) {
            if (panel) { audio.pause(); reset(); }
            panel = p;
            words = [].slice.call(p.querySelectorAll('.w'));
            starts = words.map(function (w) { return +w.dataset.s; });
            stages = [].slice.call(p.querySelectorAll('.stage'));
            pendingMs = null;
            audio.src = p.dataset.src;
        };
        // a browser drops a seek until the clip is seekable, so a stage's jump waits for it
        var pendingMs = null;
        var seekable = function () { return audio.seekable.length > 0 && audio.seekable.end(0) > 0; };
        var settle = function () {
            if (pendingMs != null && seekable()) { audio.currentTime = pendingMs / 1000; pendingMs = null; }
        };
        ['loadedmetadata', 'durationchange', 'canplay', 'progress', 'timeupdate'].forEach(function (e) { audio.addEventListener(e, settle); });
        var play = function (fromMs) {
            if (fromMs != null) { pendingMs = fromMs; settle(); }
            audio.play().catch(function () {});
        };
        audio.addEventListener('play', function () { setKey(true); cancelAnimationFrame(frame); frame = requestAnimationFrame(tick); });
        audio.addEventListener('pause', function () { setKey(false); cancelAnimationFrame(frame); });
        audio.addEventListener('ended', function () { reset(); audio.currentTime = 0; });

        panels.forEach(function (p) {
            p.querySelector('.play').addEventListener('click', function () { if (audio.paused) play(); else audio.pause(); });
            [].slice.call(p.querySelectorAll('.stage')).forEach(function (b) {
                b.addEventListener('click', function () { play(+b.dataset.from); });
            });
        });
        var show = function (i, focus) {
            if (panels[i] === panel) { if (focus) tabs[i].focus(); return; }
            tabs.forEach(function (t, j) {
                t.setAttribute('aria-selected', j === i ? 'true' : 'false');
                t.tabIndex = j === i ? 0 : -1;
                panels[j].hidden = j !== i;
            });
            select(panels[i]);
            if (focus) tabs[i].focus();
        };
        tabs.forEach(function (t, i) {
            t.addEventListener('click', function () { show(i); });
            t.addEventListener('keydown', function (e) {
                if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                    e.preventDefault();
                    show((i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length, true);
                }
            });
        });
        show(0);
    })();

    // ---- the Sound Lab: ten words, sheep or ship, in six voices; the right one shown at once; an exact count at the end ----
    (function () {
        var lab = $('lab');
        if (!lab) return;
        var playKey = $('lab-play'), status = $('lab-status'), reveal = $('lab-reveal'), count = $('lab-count');
        var tiles = [].slice.call(lab.querySelectorAll('.tile'));
        var N = 10, trials = [], k = -1, right = 0, answered = false, clips = {};
        var shuffle = function (a) {
            for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
            return a;
        };
        var clip = function (word, talker) {
            var id = word + '-' + talker;
            if (!clips[id]) { clips[id] = new Audio('assets/demo/' + id + '.m4a'); clips[id].preload = 'auto'; }
            return clips[id];
        };
        var say = function (word, talker, then) {
            Object.keys(clips).forEach(function (id) { clips[id].pause(); });
            var a = clip(word, talker);
            a.currentTime = 0;
            a.onended = then || null;
            // a replay that interrupts a loading clip rejects its play() with AbortError: the replay's own end opens the tiles
            a.play().catch(function (e) { if (then && (!e || e.name !== 'AbortError')) then(); });
        };
        var open = function () { if (!answered) tiles.forEach(function (b) { b.disabled = false; }); };
        var replay = function () { var t = trials[k]; say(t.word, t.talker, open); };
        var label = function (text) { playKey.querySelector('span').textContent = text; };
        var start = function () {
            var words = shuffle(['sheep', 'sheep', 'sheep', 'sheep', 'sheep', 'ship', 'ship', 'ship', 'ship', 'ship']);
            var talkers = shuffle([1, 2, 3, 4, 5, 6]).concat(shuffle([1, 2, 3, 4, 5, 6]));
            trials = words.map(function (w, i) { return { word: w, talker: talkers[i] }; });
            k = -1; right = 0;
            next();
        };
        var next = function () {
            k += 1;
            answered = false;
            reveal.classList.add('hidden');
            tiles.forEach(function (t) { t.classList.remove('right', 'wrong'); t.disabled = true; });
            if (k >= N) {
                status.textContent = 'You heard ' + right + ' of ' + N + ' right. In the app, the Sound Lab trains the sound pairs that matter for your first language.';
                count.textContent = '';
                label('Start again');
                playKey.disabled = false;
                playKey.focus();
                return;
            }
            count.textContent = (k + 1) + ' of ' + N;
            status.textContent = 'Word ' + (k + 1) + ' of ' + N + '. Listen, then pick the word you heard.';
            label('Play it again');
            playKey.focus();
            // the tiles wait for the word (P9 › Trial behavior)
            replay();
        };
        var pick = function (word) {
            if (answered || k < 0 || k >= N) return;
            answered = true;
            var t = trials[k];
            if (word === t.word) right += 1;
            tiles.forEach(function (b) {
                b.disabled = true;
                if (b.dataset.word === t.word) b.classList.add('right');
                else if (b.dataset.word === word) b.classList.add('wrong');
            });
            status.textContent = 'It was “' + t.word + '.” Hear both again, then go on.';
            reveal.classList.remove('hidden');
            $('lab-next').focus();
        };
        playKey.addEventListener('click', function () {
            if (k < 0 || k >= N) { start(); return; }
            replay();
        });
        tiles.forEach(function (b) { b.addEventListener('click', function () { pick(b.dataset.word); }); });
        [].slice.call(reveal.querySelectorAll('[data-hear]')).forEach(function (b) {
            b.addEventListener('click', function () { say(b.dataset.hear, trials[k].talker); });
        });
        $('lab-next').addEventListener('click', next);
        // the app's keys: 1 or 2 picks, R replays
        lab.addEventListener('keydown', function (e) {
            if (e.metaKey || e.ctrlKey || e.altKey) return;
            if ((e.key === '1' || e.key === '2') && !tiles[0].disabled) { e.preventDefault(); pick(tiles[+e.key - 1].dataset.word); }
            if ((e.key === 'r' || e.key === 'R') && k >= 0 && k < N) { e.preventDefault(); if (answered) say(trials[k].word, trials[k].talker); else replay(); }
        });
    })();
})();
