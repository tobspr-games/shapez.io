!(function(e, t) {
    if ("object" == typeof exports && "object" == typeof module) module.exports = t();
    else if ("function" == typeof define && define.amd) define([], t);
    else {
        var r = t();
        for (var n in r)("object" == typeof exports ? exports : e)[n] = r[n];
    }
})("undefined" != typeof self ? self : this, function() {
    return (function(e) {
        var t = {};

        function r(n) {
            if (t[n]) return t[n].exports;
            var i = (t[n] = { i: n, l: !1, exports: {} });
            return e[n].call(i.exports, i, i.exports, r), (i.l = !0), i.exports;
        }
        return (
            (r.m = e),
            (r.c = t),
            (r.d = function(e, t, n) {
                r.o(e, t) || Object.defineProperty(e, t, { configurable: !1, enumerable: !0, get: n });
            }),
            (r.n = function(e) {
                var t =
                    e && e.__esModule ?

                    function() {
                        return e.default;
                    } :
                    function() {
                        return e;
                    };
                return r.d(t, "a", t), t;
            }),
            (r.o = function(e, t) {
                return Object.prototype.hasOwnProperty.call(e, t);
            }),
            (r.p = ""),
            r((r.s = 14))
        );
    })([
        function(e, t, r) {
            "use strict";
            Object.defineProperty(t, "__esModule", { value: !0 });
            var n =
                "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ?

                function(e) {
                    return typeof e;
                } :
                function(e) {
                    return e &&
                        "function" == typeof Symbol &&
                        e.constructor === Symbol &&
                        e !== Symbol.prototype ?
                        "symbol" :
                        typeof e;
                };

            function i(e) {
                if (Array.isArray(e)) {
                    for (var t = 0, r = Array(e.length); t < e.length; t++) r[t] = e[t];
                    return r;
                }
                return Array.from(e);
            }
            var o = (t.jsSelector = function(e) {
                    return ".js_" + e;
                }),
                a = (t.$$ = function(e) {
                    var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : document;
                    return [].concat(i(t.querySelectorAll(e)));
                }),
                l = (t.$ = function(e) {
                    return (arguments.length > 1 && void 0 !== arguments[1] ?
                        arguments[1] :
                        document
                    ).querySelector(e);
                }),
                s =
                ((t._$$ = function(e) {
                        var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : document;
                        return [].concat(i(t.querySelectorAll(o(e))));
                    }),
                    (t._$ = function(e) {
                        return (arguments.length > 1 && void 0 !== arguments[1] ?
                            arguments[1] :
                            document
                        ).querySelector(o(e));
                    })),
                c =
                ((t._closest = function(e, t) {
                        return e.closest(o(t));
                    }),
                    (t.closest = function(e, t) {
                        return e.closest(t);
                    }),
                    (t.createElement = function(e, t, r) {
                        var i = document.createElement(e);
                        for (var o in t) i.setAttribute(o, t[o]);
                        switch (void 0 === r ? "undefined" : n(r)) {
                            case "string":
                                i.innerHTML = r;
                                break;
                            case "object":
                                "http://www.w3.org/1999/xhtml" === r.namespaceURI && i.appendChild(r);
                        }
                        return i;
                    }),
                    (t.body = document.body)),
                u = ((t.documentElement = document.documentElement), (t.mainHeader = s("mainHeader", c))),
                d = ((t.sidebarLeft = s("sidebarLeft", c)), (t.sidebarRight = s("sidebarRight", c))),
                f =
                ((t.settingsSwitch = s("settingsSwitch", u)),
                    (t.modeSwitch = s("modeSwitch", u)),
                    (t.menuSwitch = s("menuSwitch", u)),
                    (t.searchBox = s("searchBox", u)));
            (t.searchInput = s("searchInput", f)),
            (t.searchResult = s("searchResult", f)),
            (t.searchIcon = s("searchIcon", f)),
            (t.colorschemeOptions = s("colorschemeOptions", d)),
            (t.fontOptions = s("fontOptions", d)),
            (t.githubLink = l(o("mainHeader") + " > a:last-child")),
            (t.codeBlocks = a("pre"));
        },
        function(e, t, r) {
            "use strict";
            Object.defineProperty(t, "__esModule", { value: !0 }),
                (t.setLocalStorage = t.getLocalStorage = t.storageId = t.localStorage = void 0);
            var n = r(4),
                i = window.localStorage;
            t.localStorage = i;
            var o = (t.storageId = function(e) {
                    return "__esdoc-custom-theme__" + e + "__";
                }),
                a = (t.getLocalStorage = function(e) {
                    return i.getItem(o(e));
                }),
                l =
                ((t.setLocalStorage = function(e, t) {
                    return i.setItem(o(e), t);
                }), {
                    colorscheme: a("colorscheme") || "zenburn",
                    mode: a("mode") || "dark",
                    font: a("font") || n.defaultFont.key,
                    selectedIndex: -1,
                    prevText: "",
                    sidebarLeft: !1,
                });
            t.default = l;
        },
        function(e, t, r) {
            var n;
            (n = function() {
                "use strict";
                var e = navigator.userAgent,
                    t = navigator.platform,
                    r = /gecko\/\d/i.test(e),
                    n = /MSIE \d/.test(e),
                    i = /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(e),
                    o = /Edge\/(\d+)/.exec(e),
                    a = n || i || o,
                    l = a && (n ? document.documentMode || 6 : +(o || i)[1]),
                    s = !o && /WebKit\//.test(e),
                    c = s && /Qt\/\d+\.\d+/.test(e),
                    u = !o && /Chrome\//.test(e),
                    d = /Opera\//.test(e),
                    f = /Apple Computer/.test(navigator.vendor),
                    h = /Mac OS X 1\d\D([8-9]|\d\d)\D/.test(e),
                    p = /PhantomJS/.test(e),
                    m = !o && /AppleWebKit/.test(e) && /Mobile\/\w+/.test(e),
                    g = /Android/.test(e),
                    v = m || g || /webOS|BlackBerry|Opera Mini|Opera Mobi|IEMobile/i.test(e),
                    y = m || /Mac/.test(t),
                    b = /\bCrOS\b/.test(e),
                    w = /win/i.test(t),
                    x = d && e.match(/Version\/(\d*\.\d*)/);
                x && (x = Number(x[1])), x && x >= 15 && ((d = !1), (s = !0));
                var k = y && (c || (d && (null == x || x < 12.11))),
                    C = r || (a && l >= 9);

                function S(e) {
                    return new RegExp("(^|\\s)" + e + "(?:$|\\s)\\s*");
                }
                var L,
                    M = function(e, t) {
                        var r = e.className,
                            n = S(t).exec(r);
                        if (n) {
                            var i = r.slice(n.index + n[0].length);
                            e.className = r.slice(0, n.index) + (i ? n[1] + i : "");
                        }
                    };

                function T(e) {
                    for (var t = e.childNodes.length; t > 0; --t) e.removeChild(e.firstChild);
                    return e;
                }

                function O(e, t) {
                    return T(e).appendChild(t);
                }

                function A(e, t, r, n) {
                    var i = document.createElement(e);
                    if ((r && (i.className = r), n && (i.style.cssText = n), "string" == typeof t))
                        i.appendChild(document.createTextNode(t));
                    else if (t)
                        for (var o = 0; o < t.length; ++o) i.appendChild(t[o]);
                    return i;
                }

                function z(e, t, r, n) {
                    var i = A(e, t, r, n);
                    return i.setAttribute("role", "presentation"), i;
                }

                function N(e, t) {
                    if ((3 == t.nodeType && (t = t.parentNode), e.contains)) return e.contains(t);
                    do {
                        if ((11 == t.nodeType && (t = t.host), t == e)) return !0;
                    } while ((t = t.parentNode));
                }

                function E() {
                    var e;
                    try {
                        e = document.activeElement;
                    } catch (t) {
                        e = document.body || null;
                    }
                    for (; e && e.shadowRoot && e.shadowRoot.activeElement;) e = e.shadowRoot.activeElement;
                    return e;
                }

                function W(e, t) {
                    var r = e.className;
                    S(t).test(r) || (e.className += (r ? " " : "") + t);
                }

                function P(e, t) {
                    for (var r = e.split(" "), n = 0; n < r.length; n++)
                        r[n] && !S(r[n]).test(t) && (t += " " + r[n]);
                    return t;
                }
                L = document.createRange ?

                    function(e, t, r, n) {
                        var i = document.createRange();
                        return i.setEnd(n || e, r), i.setStart(e, t), i;
                    } :
                    function(e, t, r) {
                        var n = document.body.createTextRange();
                        try {
                            n.moveToElementText(e.parentNode);
                        } catch (e) {
                            return n;
                        }
                        return n.collapse(!0), n.moveEnd("character", r), n.moveStart("character", t), n;
                    };
                var H = function(e) {
                    e.select();
                };

                function D(e) {
                    var t = Array.prototype.slice.call(arguments, 1);
                    return function() {
                        return e.apply(null, t);
                    };
                }

                function I(e, t, r) {
                    for (var n in (t || (t = {}), e))
                        !e.hasOwnProperty(n) || (!1 === r && t.hasOwnProperty(n)) || (t[n] = e[n]);
                    return t;
                }

                function j(e, t, r, n, i) {
                    null == t && -1 == (t = e.search(/[^\s\u00a0]/)) && (t = e.length);
                    for (var o = n || 0, a = i || 0;;) {
                        var l = e.indexOf("\t", o);
                        if (l < 0 || l >= t) return a + (t - o);
                        (a += l - o), (a += r - (a % r)), (o = l + 1);
                    }
                }
                m
                    ?
                    (H = function(e) {
                        (e.selectionStart = 0), (e.selectionEnd = e.value.length);
                    }) :
                    a &&
                    (H = function(e) {
                        try {
                            e.select();
                        } catch (e) {}
                    });
                var F = function() {
                    this.id = null;
                };

                function R(e, t) {
                    for (var r = 0; r < e.length; ++r)
                        if (e[r] == t) return r;
                    return -1;
                }
                F.prototype.set = function(e, t) {
                    clearTimeout(this.id), (this.id = setTimeout(t, e));
                };
                var _ = 30,
                    B = {
                        toString: function() {
                            return "CodeMirror.Pass";
                        },
                    },
                    $ = { scroll: !1 },
                    q = { origin: "*mouse" },
                    U = { origin: "+move" };

                function V(e, t, r) {
                    for (var n = 0, i = 0;;) {
                        var o = e.indexOf("\t", n); -
                        1 == o && (o = e.length);
                        var a = o - n;
                        if (o == e.length || i + a >= t) return n + Math.min(a, t - i);
                        if (((i += o - n), (n = o + 1), (i += r - (i % r)) >= t)) return n;
                    }
                }
                var K = [""];

                function G(e) {
                    for (; K.length <= e;) K.push(X(K) + " ");
                    return K[e];
                }

                function X(e) {
                    return e[e.length - 1];
                }

                function Y(e, t) {
                    for (var r = [], n = 0; n < e.length; n++) r[n] = t(e[n], n);
                    return r;
                }

                function Z() {}

                function Q(e, t) {
                    var r;
                    return (
                        Object.create ? (r = Object.create(e)) : ((Z.prototype = e), (r = new Z())),
                        t && I(t, r),
                        r
                    );
                }
                var J = /[\u00df\u0587\u0590-\u05f4\u0600-\u06ff\u3040-\u309f\u30a0-\u30ff\u3400-\u4db5\u4e00-\u9fcc\uac00-\ud7af]/;

                function ee(e) {
                    return /\w/.test(e) || (e > "" && (e.toUpperCase() != e.toLowerCase() || J.test(e)));
                }

                function te(e, t) {
                    return t ? !!(t.source.indexOf("\\w") > -1 && ee(e)) || t.test(e) : ee(e);
                }

                function re(e) {
                    for (var t in e)
                        if (e.hasOwnProperty(t) && e[t]) return !1;
                    return !0;
                }
                var ne = /[\u0300-\u036f\u0483-\u0489\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u064b-\u065e\u0670\u06d6-\u06dc\u06de-\u06e4\u06e7\u06e8\u06ea-\u06ed\u0711\u0730-\u074a\u07a6-\u07b0\u07eb-\u07f3\u0816-\u0819\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0900-\u0902\u093c\u0941-\u0948\u094d\u0951-\u0955\u0962\u0963\u0981\u09bc\u09be\u09c1-\u09c4\u09cd\u09d7\u09e2\u09e3\u0a01\u0a02\u0a3c\u0a41\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a70\u0a71\u0a75\u0a81\u0a82\u0abc\u0ac1-\u0ac5\u0ac7\u0ac8\u0acd\u0ae2\u0ae3\u0b01\u0b3c\u0b3e\u0b3f\u0b41-\u0b44\u0b4d\u0b56\u0b57\u0b62\u0b63\u0b82\u0bbe\u0bc0\u0bcd\u0bd7\u0c3e-\u0c40\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62\u0c63\u0cbc\u0cbf\u0cc2\u0cc6\u0ccc\u0ccd\u0cd5\u0cd6\u0ce2\u0ce3\u0d3e\u0d41-\u0d44\u0d4d\u0d57\u0d62\u0d63\u0dca\u0dcf\u0dd2-\u0dd4\u0dd6\u0ddf\u0e31\u0e34-\u0e3a\u0e47-\u0e4e\u0eb1\u0eb4-\u0eb9\u0ebb\u0ebc\u0ec8-\u0ecd\u0f18\u0f19\u0f35\u0f37\u0f39\u0f71-\u0f7e\u0f80-\u0f84\u0f86\u0f87\u0f90-\u0f97\u0f99-\u0fbc\u0fc6\u102d-\u1030\u1032-\u1037\u1039\u103a\u103d\u103e\u1058\u1059\u105e-\u1060\u1071-\u1074\u1082\u1085\u1086\u108d\u109d\u135f\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17b7-\u17bd\u17c6\u17c9-\u17d3\u17dd\u180b-\u180d\u18a9\u1920-\u1922\u1927\u1928\u1932\u1939-\u193b\u1a17\u1a18\u1a56\u1a58-\u1a5e\u1a60\u1a62\u1a65-\u1a6c\u1a73-\u1a7c\u1a7f\u1b00-\u1b03\u1b34\u1b36-\u1b3a\u1b3c\u1b42\u1b6b-\u1b73\u1b80\u1b81\u1ba2-\u1ba5\u1ba8\u1ba9\u1c2c-\u1c33\u1c36\u1c37\u1cd0-\u1cd2\u1cd4-\u1ce0\u1ce2-\u1ce8\u1ced\u1dc0-\u1de6\u1dfd-\u1dff\u200c\u200d\u20d0-\u20f0\u2cef-\u2cf1\u2de0-\u2dff\u302a-\u302f\u3099\u309a\ua66f-\ua672\ua67c\ua67d\ua6f0\ua6f1\ua802\ua806\ua80b\ua825\ua826\ua8c4\ua8e0-\ua8f1\ua926-\ua92d\ua947-\ua951\ua980-\ua982\ua9b3\ua9b6-\ua9b9\ua9bc\uaa29-\uaa2e\uaa31\uaa32\uaa35\uaa36\uaa43\uaa4c\uaab0\uaab2-\uaab4\uaab7\uaab8\uaabe\uaabf\uaac1\uabe5\uabe8\uabed\udc00-\udfff\ufb1e\ufe00-\ufe0f\ufe20-\ufe26\uff9e\uff9f]/;

                function ie(e) {
                    return e.charCodeAt(0) >= 768 && ne.test(e);
                }

                function oe(e, t, r) {
                    for (;
                        (r < 0 ? t > 0 : t < e.length) && ie(e.charAt(t));) t += r;
                    return t;
                }

                function ae(e, t, r) {
                    for (var n = t > r ? -1 : 1;;) {
                        if (t == r) return t;
                        var i = (t + r) / 2,
                            o = n < 0 ? Math.ceil(i) : Math.floor(i);
                        if (o == t) return e(o) ? t : r;
                        e(o) ? (r = o) : (t = o + n);
                    }
                }

                function le(e, t) {
                    if ((t -= e.first) < 0 || t >= e.size)
                        throw new Error("There is no line " + (t + e.first) + " in the document.");
                    for (var r = e; !r.lines;)
                        for (var n = 0;; ++n) {
                            var i = r.children[n],
                                o = i.chunkSize();
                            if (t < o) {
                                r = i;
                                break;
                            }
                            t -= o;
                        }
                    return r.lines[t];
                }

                function se(e, t, r) {
                    var n = [],
                        i = t.line;
                    return (
                        e.iter(t.line, r.line + 1, function(e) {
                            var o = e.text;
                            i == r.line && (o = o.slice(0, r.ch)),
                                i == t.line && (o = o.slice(t.ch)),
                                n.push(o),
                                ++i;
                        }),
                        n
                    );
                }

                function ce(e, t, r) {
                    var n = [];
                    return (
                        e.iter(t, r, function(e) {
                            n.push(e.text);
                        }),
                        n
                    );
                }

                function ue(e, t) {
                    var r = t - e.height;
                    if (r)
                        for (var n = e; n; n = n.parent) n.height += r;
                }

                function de(e) {
                    if (null == e.parent) return null;
                    for (var t = e.parent, r = R(t.lines, e), n = t.parent; n; t = n, n = n.parent)
                        for (var i = 0; n.children[i] != t; ++i) r += n.children[i].chunkSize();
                    return r + t.first;
                }

                function fe(e, t) {
                    var r = e.first;
                    e: do {
                        for (var n = 0; n < e.children.length; ++n) {
                            var i = e.children[n],
                                o = i.height;
                            if (t < o) {
                                e = i;
                                continue e;
                            }
                            (t -= o), (r += i.chunkSize());
                        }
                        return r;
                    } while (!e.lines);
                    for (var a = 0; a < e.lines.length; ++a) {
                        var l = e.lines[a].height;
                        if (t < l) break;
                        t -= l;
                    }
                    return r + a;
                }

                function he(e, t) {
                    return t >= e.first && t < e.first + e.size;
                }

                function pe(e, t) {
                    return String(e.lineNumberFormatter(t + e.firstLineNumber));
                }

                function me(e, t, r) {
                    if ((void 0 === r && (r = null), !(this instanceof me))) return new me(e, t, r);
                    (this.line = e), (this.ch = t), (this.sticky = r);
                }

                function ge(e, t) {
                    return e.line - t.line || e.ch - t.ch;
                }

                function ve(e, t) {
                    return e.sticky == t.sticky && 0 == ge(e, t);
                }

                function ye(e) {
                    return me(e.line, e.ch);
                }

                function be(e, t) {
                    return ge(e, t) < 0 ? t : e;
                }

                function we(e, t) {
                    return ge(e, t) < 0 ? e : t;
                }

                function xe(e, t) {
                    return Math.max(e.first, Math.min(t, e.first + e.size - 1));
                }

                function ke(e, t) {
                    if (t.line < e.first) return me(e.first, 0);
                    var r = e.first + e.size - 1;
                    return t.line > r ?
                        me(r, le(e, r).text.length) :
                        (function(e, t) {
                            var r = e.ch;
                            return null == r || r > t ? me(e.line, t) : r < 0 ? me(e.line, 0) : e;
                        })(t, le(e, t.line).text.length);
                }

                function Ce(e, t) {
                    for (var r = [], n = 0; n < t.length; n++) r[n] = ke(e, t[n]);
                    return r;
                }
                var Se = !1,
                    Le = !1;

                function Me(e, t, r) {
                    (this.marker = e), (this.from = t), (this.to = r);
                }

                function Te(e, t) {
                    if (e)
                        for (var r = 0; r < e.length; ++r) {
                            var n = e[r];
                            if (n.marker == t) return n;
                        }
                }

                function Oe(e, t) {
                    for (var r, n = 0; n < e.length; ++n) e[n] != t && (r || (r = [])).push(e[n]);
                    return r;
                }

                function Ae(e, t) {
                    if (t.full) return null;
                    var r = he(e, t.from.line) && le(e, t.from.line).markedSpans,
                        n = he(e, t.to.line) && le(e, t.to.line).markedSpans;
                    if (!r && !n) return null;
                    var i = t.from.ch,
                        o = t.to.ch,
                        a = 0 == ge(t.from, t.to),
                        l = (function(e, t, r) {
                            var n;
                            if (e)
                                for (var i = 0; i < e.length; ++i) {
                                    var o = e[i],
                                        a = o.marker;
                                    if (
                                        null == o.from ||
                                        (a.inclusiveLeft ? o.from <= t : o.from < t) ||
                                        (o.from == t && "bookmark" == a.type && (!r || !o.marker.insertLeft))
                                    ) {
                                        var l = null == o.to || (a.inclusiveRight ? o.to >= t : o.to > t);
                                        (n || (n = [])).push(new Me(a, o.from, l ? null : o.to));
                                    }
                                }
                            return n;
                        })(r, i, a),
                        s = (function(e, t, r) {
                            var n;
                            if (e)
                                for (var i = 0; i < e.length; ++i) {
                                    var o = e[i],
                                        a = o.marker;
                                    if (
                                        null == o.to ||
                                        (a.inclusiveRight ? o.to >= t : o.to > t) ||
                                        (o.from == t && "bookmark" == a.type && (!r || o.marker.insertLeft))
                                    ) {
                                        var l =
                                            null == o.from || (a.inclusiveLeft ? o.from <= t : o.from < t);
                                        (n || (n = [])).push(
                                            new Me(a, l ? null : o.from - t, null == o.to ? null : o.to - t)
                                        );
                                    }
                                }
                            return n;
                        })(n, o, a),
                        c = 1 == t.text.length,
                        u = X(t.text).length + (c ? i : 0);
                    if (l)
                        for (var d = 0; d < l.length; ++d) {
                            var f = l[d];
                            if (null == f.to) {
                                var h = Te(s, f.marker);
                                h ? c && (f.to = null == h.to ? null : h.to + u) : (f.to = i);
                            }
                        }
                    if (s)
                        for (var p = 0; p < s.length; ++p) {
                            var m = s[p];
                            if ((null != m.to && (m.to += u), null == m.from))
                                Te(l, m.marker) || ((m.from = u), c && (l || (l = [])).push(m));
                            else(m.from += u), c && (l || (l = [])).push(m);
                        }
                    l && (l = ze(l)), s && s != l && (s = ze(s));
                    var g = [l];
                    if (!c) {
                        var v,
                            y = t.text.length - 2;
                        if (y > 0 && l)
                            for (var b = 0; b < l.length; ++b)
                                null == l[b].to && (v || (v = [])).push(new Me(l[b].marker, null, null));
                        for (var w = 0; w < y; ++w) g.push(v);
                        g.push(s);
                    }
                    return g;
                }

                function ze(e) {
                    for (var t = 0; t < e.length; ++t) {
                        var r = e[t];
                        null != r.from &&
                            r.from == r.to &&
                            !1 !== r.marker.clearWhenEmpty &&
                            e.splice(t--, 1);
                    }
                    return e.length ? e : null;
                }

                function Ne(e) {
                    var t = e.markedSpans;
                    if (t) {
                        for (var r = 0; r < t.length; ++r) t[r].marker.detachLine(e);
                        e.markedSpans = null;
                    }
                }

                function Ee(e, t) {
                    if (t) {
                        for (var r = 0; r < t.length; ++r) t[r].marker.attachLine(e);
                        e.markedSpans = t;
                    }
                }

                function We(e) {
                    return e.inclusiveLeft ? -1 : 0;
                }

                function Pe(e) {
                    return e.inclusiveRight ? 1 : 0;
                }

                function He(e, t) {
                    var r = e.lines.length - t.lines.length;
                    if (0 != r) return r;
                    var n = e.find(),
                        i = t.find(),
                        o = ge(n.from, i.from) || We(e) - We(t);
                    if (o) return -o;
                    var a = ge(n.to, i.to) || Pe(e) - Pe(t);
                    return a || t.id - e.id;
                }

                function De(e, t) {
                    var r,
                        n = Le && e.markedSpans;
                    if (n)
                        for (var i = void 0, o = 0; o < n.length; ++o)
                            (i = n[o]).marker.collapsed &&
                            null == (t ? i.from : i.to) &&
                            (!r || He(r, i.marker) < 0) &&
                            (r = i.marker);
                    return r;
                }

                function Ie(e) {
                    return De(e, !0);
                }

                function je(e) {
                    return De(e, !1);
                }

                function Fe(e, t, r, n, i) {
                    var o = le(e, t),
                        a = Le && o.markedSpans;
                    if (a)
                        for (var l = 0; l < a.length; ++l) {
                            var s = a[l];
                            if (s.marker.collapsed) {
                                var c = s.marker.find(0),
                                    u = ge(c.from, r) || We(s.marker) - We(i),
                                    d = ge(c.to, n) || Pe(s.marker) - Pe(i);
                                if (!((u >= 0 && d <= 0) || (u <= 0 && d >= 0)) &&
                                    ((u <= 0 &&
                                            (s.marker.inclusiveRight && i.inclusiveLeft ?
                                                ge(c.to, r) >= 0 :
                                                ge(c.to, r) > 0)) ||
                                        (u >= 0 &&
                                            (s.marker.inclusiveRight && i.inclusiveLeft ?
                                                ge(c.from, n) <= 0 :
                                                ge(c.from, n) < 0)))
                                )
                                    return !0;
                            }
                        }
                }

                function Re(e) {
                    for (var t;
                        (t = Ie(e));) e = t.find(-1, !0).line;
                    return e;
                }

                function _e(e, t) {
                    var r = le(e, t),
                        n = Re(r);
                    return r == n ? t : de(n);
                }

                function Be(e, t) {
                    if (t > e.lastLine()) return t;
                    var r,
                        n = le(e, t);
                    if (!$e(e, n)) return t;
                    for (;
                        (r = je(n));) n = r.find(1, !0).line;
                    return de(n) + 1;
                }

                function $e(e, t) {
                    var r = Le && t.markedSpans;
                    if (r)
                        for (var n = void 0, i = 0; i < r.length; ++i)
                            if ((n = r[i]).marker.collapsed) {
                                if (null == n.from) return !0;
                                if (!n.marker.widgetNode &&
                                    0 == n.from &&
                                    n.marker.inclusiveLeft &&
                                    qe(e, t, n)
                                )
                                    return !0;
                            }
                }

                function qe(e, t, r) {
                    if (null == r.to) {
                        var n = r.marker.find(1, !0);
                        return qe(e, n.line, Te(n.line.markedSpans, r.marker));
                    }
                    if (r.marker.inclusiveRight && r.to == t.text.length) return !0;
                    for (var i = void 0, o = 0; o < t.markedSpans.length; ++o)
                        if (
                            (i = t.markedSpans[o]).marker.collapsed &&
                            !i.marker.widgetNode &&
                            i.from == r.to &&
                            (null == i.to || i.to != r.from) &&
                            (i.marker.inclusiveLeft || r.marker.inclusiveRight) &&
                            qe(e, t, i)
                        )
                            return !0;
                }

                function Ue(e) {
                    for (var t = 0, r = (e = Re(e)).parent, n = 0; n < r.lines.length; ++n) {
                        var i = r.lines[n];
                        if (i == e) break;
                        t += i.height;
                    }
                    for (var o = r.parent; o; o = (r = o).parent)
                        for (var a = 0; a < o.children.length; ++a) {
                            var l = o.children[a];
                            if (l == r) break;
                            t += l.height;
                        }
                    return t;
                }

                function Ve(e) {
                    if (0 == e.height) return 0;
                    for (var t, r = e.text.length, n = e;
                        (t = Ie(n));) {
                        var i = t.find(0, !0);
                        (n = i.from.line), (r += i.from.ch - i.to.ch);
                    }
                    for (n = e;
                        (t = je(n));) {
                        var o = t.find(0, !0);
                        (r -= n.text.length - o.from.ch), (r += (n = o.to.line).text.length - o.to.ch);
                    }
                    return r;
                }

                function Ke(e) {
                    var t = e.display,
                        r = e.doc;
                    (t.maxLine = le(r, r.first)),
                    (t.maxLineLength = Ve(t.maxLine)),
                    (t.maxLineChanged = !0),
                    r.iter(function(e) {
                        var r = Ve(e);
                        r > t.maxLineLength && ((t.maxLineLength = r), (t.maxLine = e));
                    });
                }
                var Ge = null;

                function Xe(e, t, r) {
                    var n;
                    Ge = null;
                    for (var i = 0; i < e.length; ++i) {
                        var o = e[i];
                        if (o.from < t && o.to > t) return i;
                        o.to == t && (o.from != o.to && "before" == r ? (n = i) : (Ge = i)),
                            o.from == t && (o.from != o.to && "before" != r ? (n = i) : (Ge = i));
                    }
                    return null != n ? n : Ge;
                }
                var Ye = (function() {
                    var e =
                        "bbbbbbbbbtstwsbbbbbbbbbbbbbbssstwNN%%%NNNNNN,N,N1111111111NNNNNNNLLLLLLLLLLLLLLLLLLLLLLLLLLNNNNNNLLLLLLLLLLLLLLLLLLLLLLLLLLNNNNbbbbbbsbbbbbbbbbbbbbbbbbbbbbbbbbb,N%%%%NNNNLNNNNN%%11NLNNN1LNNNNNLLLLLLLLLLLLLLLLLLLLLLLNLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLN",
                        t =
                        "nnnnnnNNr%%r,rNNmmmmmmmmmmmrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrmmmmmmmmmmmmmmmmmmmmmnnnnnnnnnn%nnrrrmrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrmmmmmmmnNmmmmmmrrmmNmmmmrr1111111111";
                    var r = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac]/,
                        n = /[stwN]/,
                        i = /[LRr]/,
                        o = /[Lb1n]/,
                        a = /[1n]/;

                    function l(e, t, r) {
                        (this.level = e), (this.from = t), (this.to = r);
                    }
                    return function(s, c) {
                        var u = "ltr" == c ? "L" : "R";
                        if (0 == s.length || ("ltr" == c && !r.test(s))) return !1;
                        for (var d, f = s.length, h = [], p = 0; p < f; ++p)
                            h.push(
                                (d = s.charCodeAt(p)) <= 247 ?
                                e.charAt(d) :
                                1424 <= d && d <= 1524 ?
                                "R" :
                                1536 <= d && d <= 1785 ?
                                t.charAt(d - 1536) :
                                1774 <= d && d <= 2220 ?
                                "r" :
                                8192 <= d && d <= 8203 ?
                                "w" :
                                8204 == d ?
                                "b" :
                                "L"
                            );
                        for (var m = 0, g = u; m < f; ++m) {
                            var v = h[m];
                            "m" == v ? (h[m] = g) : (g = v);
                        }
                        for (var y = 0, b = u; y < f; ++y) {
                            var w = h[y];
                            "1" == w && "r" == b ?
                                (h[y] = "n") :
                                i.test(w) && ((b = w), "r" == w && (h[y] = "R"));
                        }
                        for (var x = 1, k = h[0]; x < f - 1; ++x) {
                            var C = h[x];
                            "+" == C && "1" == k && "1" == h[x + 1] ?
                                (h[x] = "1") :
                                "," != C || k != h[x + 1] || ("1" != k && "n" != k) || (h[x] = k),
                                (k = C);
                        }
                        for (var S = 0; S < f; ++S) {
                            var L = h[S];
                            if ("," == L) h[S] = "N";
                            else if ("%" == L) {
                                var M = void 0;
                                for (M = S + 1; M < f && "%" == h[M]; ++M);
                                for (
                                    var T = (S && "!" == h[S - 1]) || (M < f && "1" == h[M]) ? "1" : "N",
                                        O = S; O < M;
                                    ++O
                                )
                                    h[O] = T;
                                S = M - 1;
                            }
                        }
                        for (var A = 0, z = u; A < f; ++A) {
                            var N = h[A];
                            "L" == z && "1" == N ? (h[A] = "L") : i.test(N) && (z = N);
                        }
                        for (var E = 0; E < f; ++E)
                            if (n.test(h[E])) {
                                var W = void 0;
                                for (W = E + 1; W < f && n.test(h[W]); ++W);
                                for (
                                    var P = "L" == (E ? h[E - 1] : u),
                                        H = P == ("L" == (W < f ? h[W] : u)) ? (P ? "L" : "R") : u,
                                        D = E; D < W;
                                    ++D
                                )
                                    h[D] = H;
                                E = W - 1;
                            }
                        for (var I, j = [], F = 0; F < f;)
                            if (o.test(h[F])) {
                                var R = F;
                                for (++F; F < f && o.test(h[F]); ++F);
                                j.push(new l(0, R, F));
                            } else {
                                var _ = F,
                                    B = j.length;
                                for (++F; F < f && "L" != h[F]; ++F);
                                for (var $ = _; $ < F;)
                                    if (a.test(h[$])) {
                                        _ < $ && j.splice(B, 0, new l(1, _, $));
                                        var q = $;
                                        for (++$; $ < F && a.test(h[$]); ++$);
                                        j.splice(B, 0, new l(2, q, $)), (_ = $);
                                    } else ++$;
                                _ < F && j.splice(B, 0, new l(1, _, F));
                            }
                        return (
                            "ltr" == c &&
                            (1 == j[0].level &&
                                (I = s.match(/^\s+/)) &&
                                ((j[0].from = I[0].length), j.unshift(new l(0, 0, I[0].length))),
                                1 == X(j).level &&
                                (I = s.match(/\s+$/)) &&
                                ((X(j).to -= I[0].length), j.push(new l(0, f - I[0].length, f)))),
                            "rtl" == c ? j.reverse() : j
                        );
                    };
                })();

                function Ze(e, t) {
                    var r = e.order;
                    return null == r && (r = e.order = Ye(e.text, t)), r;
                }
                var Qe = [],
                    Je = function(e, t, r) {
                        if (e.addEventListener) e.addEventListener(t, r, !1);
                        else if (e.attachEvent) e.attachEvent("on" + t, r);
                        else {
                            var n = e._handlers || (e._handlers = {});
                            n[t] = (n[t] || Qe).concat(r);
                        }
                    };

                function et(e, t) {
                    return (e._handlers && e._handlers[t]) || Qe;
                }

                function tt(e, t, r) {
                    if (e.removeEventListener) e.removeEventListener(t, r, !1);
                    else if (e.detachEvent) e.detachEvent("on" + t, r);
                    else {
                        var n = e._handlers,
                            i = n && n[t];
                        if (i) {
                            var o = R(i, r);
                            o > -1 && (n[t] = i.slice(0, o).concat(i.slice(o + 1)));
                        }
                    }
                }

                function rt(e, t) {
                    var r = et(e, t);
                    if (r.length)
                        for (var n = Array.prototype.slice.call(arguments, 2), i = 0; i < r.length; ++i)
                            r[i].apply(null, n);
                }

                function nt(e, t, r) {
                    return (
                        "string" == typeof t &&
                        (t = {
                            type: t,
                            preventDefault: function() {
                                this.defaultPrevented = !0;
                            },
                        }),
                        rt(e, r || t.type, e, t),
                        ct(t) || t.codemirrorIgnore
                    );
                }

                function it(e) {
                    var t = e._handlers && e._handlers.cursorActivity;
                    if (t)
                        for (
                            var r = e.curOp.cursorActivityHandlers || (e.curOp.cursorActivityHandlers = []),
                                n = 0; n < t.length;
                            ++n
                        )
                            -
                            1 == R(r, t[n]) && r.push(t[n]);
                }

                function ot(e, t) {
                    return et(e, t).length > 0;
                }

                function at(e) {
                    (e.prototype.on = function(e, t) {
                        Je(this, e, t);
                    }),
                    (e.prototype.off = function(e, t) {
                        tt(this, e, t);
                    });
                }

                function lt(e) {
                    e.preventDefault ? e.preventDefault() : (e.returnValue = !1);
                }

                function st(e) {
                    e.stopPropagation ? e.stopPropagation() : (e.cancelBubble = !0);
                }

                function ct(e) {
                    return null != e.defaultPrevented ? e.defaultPrevented : 0 == e.returnValue;
                }

                function ut(e) {
                    lt(e), st(e);
                }

                function dt(e) {
                    return e.target || e.srcElement;
                }

                function ft(e) {
                    var t = e.which;
                    return (
                        null == t &&
                        (1 & e.button ? (t = 1) : 2 & e.button ? (t = 3) : 4 & e.button && (t = 2)),
                        y && e.ctrlKey && 1 == t && (t = 3),
                        t
                    );
                }
                var ht,
                    pt,
                    mt = (function() {
                        if (a && l < 9) return !1;
                        var e = A("div");
                        return "draggable" in e || "dragDrop" in e;
                    })();

                function gt(e) {
                    if (null == ht) {
                        var t = A("span", "​");
                        O(e, A("span", [t, document.createTextNode("x")])),
                            0 != e.firstChild.offsetHeight &&
                            (ht = t.offsetWidth <= 1 && t.offsetHeight > 2 && !(a && l < 8));
                    }
                    var r = ht ?
                        A("span", "​") :
                        A("span", " ", null, "display: inline-block; width: 1px; margin-right: -1px");
                    return r.setAttribute("cm-text", ""), r;
                }

                function vt(e) {
                    if (null != pt) return pt;
                    var t = O(e, document.createTextNode("AخA")),
                        r = L(t, 0, 1).getBoundingClientRect(),
                        n = L(t, 1, 2).getBoundingClientRect();
                    return T(e), !(!r || r.left == r.right) && (pt = n.right - r.right < 3);
                }
                var yt,
                    bt =
                    3 != "\n\nb".split(/\n/).length ?

                    function(e) {
                        for (var t = 0, r = [], n = e.length; t <= n;) {
                            var i = e.indexOf("\n", t); -
                            1 == i && (i = e.length);
                            var o = e.slice(t, "\r" == e.charAt(i - 1) ? i - 1 : i),
                                a = o.indexOf("\r"); -
                            1 != a ?
                                (r.push(o.slice(0, a)), (t += a + 1)) :
                                (r.push(o), (t = i + 1));
                        }
                        return r;
                    } :
                    function(e) {
                        return e.split(/\r\n?|\n/);
                    },
                    wt = window.getSelection ?

                    function(e) {
                        try {
                            return e.selectionStart != e.selectionEnd;
                        } catch (e) {
                            return !1;
                        }
                    } :
                    function(e) {
                        var t;
                        try {
                            t = e.ownerDocument.selection.createRange();
                        } catch (e) {}
                        return (!(!t || t.parentElement() != e) && 0 != t.compareEndPoints("StartToEnd", t));
                    },
                    xt =
                    "oncopy" in (yt = A("div")) ||
                    (yt.setAttribute("oncopy", "return;"), "function" == typeof yt.oncopy),
                    kt = null;
                var Ct = {},
                    St = {};

                function Lt(e) {
                    if ("string" == typeof e && St.hasOwnProperty(e)) e = St[e];
                    else if (e && "string" == typeof e.name && St.hasOwnProperty(e.name)) {
                        var t = St[e.name];
                        "string" == typeof t && (t = { name: t }), ((e = Q(t, e)).name = t.name);
                    } else {
                        if ("string" == typeof e && /^[\w\-]+\/[\w\-]+\+xml$/.test(e))
                            return Lt("application/xml");
                        if ("string" == typeof e && /^[\w\-]+\/[\w\-]+\+json$/.test(e))
                            return Lt("application/json");
                    }
                    return "string" == typeof e ? { name: e } : e || { name: "null" };
                }

                function Mt(e, t) {
                    t = Lt(t);
                    var r = Ct[t.name];
                    if (!r) return Mt(e, "text/plain");
                    var n = r(e, t);
                    if (Tt.hasOwnProperty(t.name)) {
                        var i = Tt[t.name];
                        for (var o in i)
                            i.hasOwnProperty(o) &&
                            (n.hasOwnProperty(o) && (n["_" + o] = n[o]), (n[o] = i[o]));
                    }
                    if (((n.name = t.name), t.helperType && (n.helperType = t.helperType), t.modeProps))
                        for (var a in t.modeProps) n[a] = t.modeProps[a];
                    return n;
                }
                var Tt = {};

                function Ot(e, t) {
                    I(t, Tt.hasOwnProperty(e) ? Tt[e] : (Tt[e] = {}));
                }

                function At(e, t) {
                    if (!0 === t) return t;
                    if (e.copyState) return e.copyState(t);
                    var r = {};
                    for (var n in t) {
                        var i = t[n];
                        i instanceof Array && (i = i.concat([])), (r[n] = i);
                    }
                    return r;
                }

                function zt(e, t) {
                    for (var r; e.innerMode && (r = e.innerMode(t)) && r.mode != e;)
                        (t = r.state), (e = r.mode);
                    return r || { mode: e, state: t };
                }

                function Nt(e, t, r) {
                    return !e.startState || e.startState(t, r);
                }
                var Et = function(e, t, r) {
                    (this.pos = this.start = 0),
                    (this.string = e),
                    (this.tabSize = t || 8),
                    (this.lastColumnPos = this.lastColumnValue = 0),
                    (this.lineStart = 0),
                    (this.lineOracle = r);
                };
                (Et.prototype.eol = function() {
                    return this.pos >= this.string.length;
                }),
                (Et.prototype.sol = function() {
                    return this.pos == this.lineStart;
                }),
                (Et.prototype.peek = function() {
                    return this.string.charAt(this.pos) || void 0;
                }),
                (Et.prototype.next = function() {
                    if (this.pos < this.string.length) return this.string.charAt(this.pos++);
                }),
                (Et.prototype.eat = function(e) {
                    var t = this.string.charAt(this.pos);
                    if ("string" == typeof e ? t == e : t && (e.test ? e.test(t) : e(t)))
                        return ++this.pos, t;
                }),
                (Et.prototype.eatWhile = function(e) {
                    for (var t = this.pos; this.eat(e););
                    return this.pos > t;
                }),
                (Et.prototype.eatSpace = function() {
                    for (var e = this.pos;
                        /[\s\u00a0]/.test(this.string.charAt(this.pos));) ++this.pos;
                    return this.pos > e;
                }),
                (Et.prototype.skipToEnd = function() {
                    this.pos = this.string.length;
                }),
                (Et.prototype.skipTo = function(e) {
                    var t = this.string.indexOf(e, this.pos);
                    if (t > -1) return (this.pos = t), !0;
                }),
                (Et.prototype.backUp = function(e) {
                    this.pos -= e;
                }),
                (Et.prototype.column = function() {
                    return (
                        this.lastColumnPos < this.start &&
                        ((this.lastColumnValue = j(
                                this.string,
                                this.start,
                                this.tabSize,
                                this.lastColumnPos,
                                this.lastColumnValue
                            )),
                            (this.lastColumnPos = this.start)),
                        this.lastColumnValue -
                        (this.lineStart ? j(this.string, this.lineStart, this.tabSize) : 0)
                    );
                }),
                (Et.prototype.indentation = function() {
                    return (
                        j(this.string, null, this.tabSize) -
                        (this.lineStart ? j(this.string, this.lineStart, this.tabSize) : 0)
                    );
                }),
                (Et.prototype.match = function(e, t, r) {
                    if ("string" != typeof e) {
                        var n = this.string.slice(this.pos).match(e);
                        return n && n.index > 0 ? null : (n && !1 !== t && (this.pos += n[0].length), n);
                    }
                    var i = function(e) {
                        return r ? e.toLowerCase() : e;
                    };
                    if (i(this.string.substr(this.pos, e.length)) == i(e))
                        return !1 !== t && (this.pos += e.length), !0;
                }),
                (Et.prototype.current = function() {
                    return this.string.slice(this.start, this.pos);
                }),
                (Et.prototype.hideFirstChars = function(e, t) {
                    this.lineStart += e;
                    try {
                        return t();
                    } finally {
                        this.lineStart -= e;
                    }
                }),
                (Et.prototype.lookAhead = function(e) {
                    var t = this.lineOracle;
                    return t && t.lookAhead(e);
                }),
                (Et.prototype.baseToken = function() {
                    var e = this.lineOracle;
                    return e && e.baseToken(this.pos);
                });
                var Wt = function(e, t) {
                        (this.state = e), (this.lookAhead = t);
                    },
                    Pt = function(e, t, r, n) {
                        (this.state = t),
                        (this.doc = e),
                        (this.line = r),
                        (this.maxLookAhead = n || 0),
                        (this.baseTokens = null),
                        (this.baseTokenPos = 1);
                    };

                function Ht(e, t, r, n) {
                    var i = [e.state.modeGen],
                        o = {};
                    qt(
                        e,
                        t.text,
                        e.doc.mode,
                        r,
                        function(e, t) {
                            return i.push(e, t);
                        },
                        o,
                        n
                    );
                    for (
                        var a = r.state,
                            l = function(n) {
                                r.baseTokens = i;
                                var l = e.state.overlays[n],
                                    s = 1,
                                    c = 0;
                                (r.state = !0),
                                qt(
                                        e,
                                        t.text,
                                        l.mode,
                                        r,
                                        function(e, t) {
                                            for (var r = s; c < e;) {
                                                var n = i[s];
                                                n > e && i.splice(s, 1, e, i[s + 1], n),
                                                    (s += 2),
                                                    (c = Math.min(e, n));
                                            }
                                            if (t)
                                                if (l.opaque)
                                                    i.splice(r, s - r, e, "overlay " + t), (s = r + 2);
                                                else
                                                    for (; r < s; r += 2) {
                                                        var o = i[r + 1];
                                                        i[r + 1] = (o ? o + " " : "") + "overlay " + t;
                                                    }
                                        },
                                        o
                                    ),
                                    (r.state = a),
                                    (r.baseTokens = null),
                                    (r.baseTokenPos = 1);
                            },
                            s = 0; s < e.state.overlays.length;
                        ++s
                    )
                        l(s);
                    return { styles: i, classes: o.bgClass || o.textClass ? o : null };
                }

                function Dt(e, t, r) {
                    if (!t.styles || t.styles[0] != e.state.modeGen) {
                        var n = It(e, de(t)),
                            i = t.text.length > e.options.maxHighlightLength && At(e.doc.mode, n.state),
                            o = Ht(e, t, n);
                        i && (n.state = i),
                            (t.stateAfter = n.save(!i)),
                            (t.styles = o.styles),
                            o.classes ?
                            (t.styleClasses = o.classes) :
                            t.styleClasses && (t.styleClasses = null),
                            r === e.doc.highlightFrontier &&
                            (e.doc.modeFrontier = Math.max(
                                e.doc.modeFrontier,
                                ++e.doc.highlightFrontier
                            ));
                    }
                    return t.styles;
                }

                function It(e, t, r) {
                    var n = e.doc,
                        i = e.display;
                    if (!n.mode.startState) return new Pt(n, !0, t);
                    var o = (function(e, t, r) {
                            for (
                                var n,
                                    i,
                                    o = e.doc,
                                    a = r ? -1 : t - (e.doc.mode.innerMode ? 1e3 : 100),
                                    l = t; l > a;
                                --l
                            ) {
                                if (l <= o.first) return o.first;
                                var s = le(o, l - 1),
                                    c = s.stateAfter;
                                if (c && (!r || l + (c instanceof Wt ? c.lookAhead : 0) <= o.modeFrontier))
                                    return l;
                                var u = j(s.text, null, e.options.tabSize);
                                (null == i || n > u) && ((i = l - 1), (n = u));
                            }
                            return i;
                        })(e, t, r),
                        a = o > n.first && le(n, o - 1).stateAfter,
                        l = a ? Pt.fromSaved(n, a, o) : new Pt(n, Nt(n.mode), o);
                    return (
                        n.iter(o, t, function(r) {
                            jt(e, r.text, l);
                            var n = l.line;
                            (r.stateAfter =
                                n == t - 1 || n % 5 == 0 || (n >= i.viewFrom && n < i.viewTo) ?
                                l.save() :
                                null),
                            l.nextLine();
                        }),
                        r && (n.modeFrontier = l.line),
                        l
                    );
                }

                function jt(e, t, r, n) {
                    var i = e.doc.mode,
                        o = new Et(t, e.options.tabSize, r);
                    for (o.start = o.pos = n || 0, "" == t && Ft(i, r.state); !o.eol();)
                        Rt(i, o, r.state), (o.start = o.pos);
                }

                function Ft(e, t) {
                    if (e.blankLine) return e.blankLine(t);
                    if (e.innerMode) {
                        var r = zt(e, t);
                        return r.mode.blankLine ? r.mode.blankLine(r.state) : void 0;
                    }
                }

                function Rt(e, t, r, n) {
                    for (var i = 0; i < 10; i++) {
                        n && (n[0] = zt(e, r).mode);
                        var o = e.token(t, r);
                        if (t.pos > t.start) return o;
                    }
                    throw new Error("Mode " + e.name + " failed to advance stream.");
                }
                (Pt.prototype.lookAhead = function(e) {
                    var t = this.doc.getLine(this.line + e);
                    return null != t && e > this.maxLookAhead && (this.maxLookAhead = e), t;
                }),
                (Pt.prototype.baseToken = function(e) {
                    if (!this.baseTokens) return null;
                    for (; this.baseTokens[this.baseTokenPos] <= e;) this.baseTokenPos += 2;
                    var t = this.baseTokens[this.baseTokenPos + 1];
                    return {
                        type: t && t.replace(/( |^)overlay .*/, ""),
                        size: this.baseTokens[this.baseTokenPos] - e,
                    };
                }),
                (Pt.prototype.nextLine = function() {
                    this.line++, this.maxLookAhead > 0 && this.maxLookAhead--;
                }),
                (Pt.fromSaved = function(e, t, r) {
                    return t instanceof Wt ?
                        new Pt(e, At(e.mode, t.state), r, t.lookAhead) :
                        new Pt(e, At(e.mode, t), r);
                }),
                (Pt.prototype.save = function(e) {
                    var t = !1 !== e ? At(this.doc.mode, this.state) : this.state;
                    return this.maxLookAhead > 0 ? new Wt(t, this.maxLookAhead) : t;
                });
                var _t = function(e, t, r) {
                    (this.start = e.start),
                    (this.end = e.pos),
                    (this.string = e.current()),
                    (this.type = t || null),
                    (this.state = r);
                };

                function Bt(e, t, r, n) {
                    var i,
                        o,
                        a = e.doc,
                        l = a.mode,
                        s = le(a, (t = ke(a, t)).line),
                        c = It(e, t.line, r),
                        u = new Et(s.text, e.options.tabSize, c);
                    for (n && (o = []);
                        (n || u.pos < t.ch) && !u.eol();)
                        (u.start = u.pos),
                        (i = Rt(l, u, c.state)),
                        n && o.push(new _t(u, i, At(a.mode, c.state)));
                    return n ? o : new _t(u, i, c.state);
                }

                function $t(e, t) {
                    if (e)
                        for (;;) {
                            var r = e.match(/(?:^|\s+)line-(background-)?(\S+)/);
                            if (!r) break;
                            e = e.slice(0, r.index) + e.slice(r.index + r[0].length);
                            var n = r[1] ? "bgClass" : "textClass";
                            null == t[n] ?
                                (t[n] = r[2]) :
                                new RegExp("(?:^|s)" + r[2] + "(?:$|s)").test(t[n]) || (t[n] += " " + r[2]);
                        }
                    return e;
                }

                function qt(e, t, r, n, i, o, a) {
                    var l = r.flattenSpans;
                    null == l && (l = e.options.flattenSpans);
                    var s,
                        c = 0,
                        u = null,
                        d = new Et(t, e.options.tabSize, n),
                        f = e.options.addModeClass && [null];
                    for ("" == t && $t(Ft(r, n.state), o); !d.eol();) {
                        if (
                            (d.pos > e.options.maxHighlightLength ?
                                ((l = !1), a && jt(e, t, n, d.pos), (d.pos = t.length), (s = null)) :
                                (s = $t(Rt(r, d, n.state, f), o)),
                                f)
                        ) {
                            var h = f[0].name;
                            h && (s = "m-" + (s ? h + " " + s : h));
                        }
                        if (!l || u != s) {
                            for (; c < d.start;) i((c = Math.min(d.start, c + 5e3)), u);
                            u = s;
                        }
                        d.start = d.pos;
                    }
                    for (; c < d.pos;) {
                        var p = Math.min(d.pos, c + 5e3);
                        i(p, u), (c = p);
                    }
                }
                var Ut = function(e, t, r) {
                    (this.text = e), Ee(this, t), (this.height = r ? r(this) : 1);
                };

                function Vt(e) {
                    (e.parent = null), Ne(e);
                }
                (Ut.prototype.lineNo = function() {
                    return de(this);
                }),
                at(Ut);
                var Kt = {},
                    Gt = {};

                function Xt(e, t) {
                    if (!e || /^\s*$/.test(e)) return null;
                    var r = t.addModeClass ? Gt : Kt;
                    return r[e] || (r[e] = e.replace(/\S+/g, "cm-$&"));
                }

                function Yt(e, t) {
                    var r = z("span", null, null, s ? "padding-right: .1px" : null),
                        n = {
                            pre: z("pre", [r], "CodeMirror-line"),
                            content: r,
                            col: 0,
                            pos: 0,
                            cm: e,
                            trailingSpace: !1,
                            splitSpaces: (a || s) && e.getOption("lineWrapping"),
                        };
                    t.measure = {};
                    for (var i = 0; i <= (t.rest ? t.rest.length : 0); i++) {
                        var o = i ? t.rest[i - 1] : t.line,
                            l = void 0;
                        (n.pos = 0),
                        (n.addToken = Qt),
                        vt(e.display.measure) &&
                            (l = Ze(o, e.doc.direction)) &&
                            (n.addToken = Jt(n.addToken, l)),
                            (n.map = []),
                            tr(o, n, Dt(e, o, t != e.display.externalMeasured && de(o))),
                            o.styleClasses &&
                            (o.styleClasses.bgClass &&
                                (n.bgClass = P(o.styleClasses.bgClass, n.bgClass || "")),
                                o.styleClasses.textClass &&
                                (n.textClass = P(o.styleClasses.textClass, n.textClass || ""))),
                            0 == n.map.length &&
                            n.map.push(0, 0, n.content.appendChild(gt(e.display.measure))),
                            0 == i ?
                            ((t.measure.map = n.map), (t.measure.cache = {})) :
                            ((t.measure.maps || (t.measure.maps = [])).push(n.map),
                                (t.measure.caches || (t.measure.caches = [])).push({}));
                    }
                    if (s) {
                        var c = n.content.lastChild;
                        (/\bcm-tab\b/.test(c.className) || (c.querySelector && c.querySelector(".cm-tab"))) &&
                        (n.content.className = "cm-tab-wrap-hack");
                    }
                    return (
                        rt(e, "renderLine", e, t.line, n.pre),
                        n.pre.className && (n.textClass = P(n.pre.className, n.textClass || "")),
                        n
                    );
                }

                function Zt(e) {
                    var t = A("span", "•", "cm-invalidchar");
                    return (
                        (t.title = "\\u" + e.charCodeAt(0).toString(16)),
                        t.setAttribute("aria-label", t.title),
                        t
                    );
                }

                function Qt(e, t, r, n, i, o, s) {
                    if (t) {
                        var c,
                            u = e.splitSpaces ?
                            (function(e, t) {
                                if (e.length > 1 && !/  /.test(e)) return e;
                                for (var r = t, n = "", i = 0; i < e.length; i++) {
                                    var o = e.charAt(i);
                                    " " != o ||
                                        !r ||
                                        (i != e.length - 1 && 32 != e.charCodeAt(i + 1)) ||
                                        (o = " "),
                                        (n += o),
                                        (r = " " == o);
                                }
                                return n;
                            })(t, e.trailingSpace) :
                            t,
                            d = e.cm.state.specialChars,
                            f = !1;
                        if (d.test(t)) {
                            c = document.createDocumentFragment();
                            for (var h = 0;;) {
                                d.lastIndex = h;
                                var p = d.exec(t),
                                    m = p ? p.index - h : t.length - h;
                                if (m) {
                                    var g = document.createTextNode(u.slice(h, h + m));
                                    a && l < 9 ? c.appendChild(A("span", [g])) : c.appendChild(g),
                                        e.map.push(e.pos, e.pos + m, g),
                                        (e.col += m),
                                        (e.pos += m);
                                }
                                if (!p) break;
                                h += m + 1;
                                var v = void 0;
                                if ("\t" == p[0]) {
                                    var y = e.cm.options.tabSize,
                                        b = y - (e.col % y);
                                    (v = c.appendChild(A("span", G(b), "cm-tab"))).setAttribute(
                                            "role",
                                            "presentation"
                                        ),
                                        v.setAttribute("cm-text", "\t"),
                                        (e.col += b);
                                } else
                                    "\r" == p[0] || "\n" == p[0] ?
                                    ((v = c.appendChild(
                                            A("span", "\r" == p[0] ? "␍" : "␤", "cm-invalidchar")
                                        )).setAttribute("cm-text", p[0]),
                                        (e.col += 1)) :
                                    ((v = e.cm.options.specialCharPlaceholder(p[0])).setAttribute(
                                            "cm-text",
                                            p[0]
                                        ),
                                        a && l < 9 ? c.appendChild(A("span", [v])) : c.appendChild(v),
                                        (e.col += 1));
                                e.map.push(e.pos, e.pos + 1, v), e.pos++;
                            }
                        } else
                            (e.col += t.length),
                            (c = document.createTextNode(u)),
                            e.map.push(e.pos, e.pos + t.length, c),
                            a && l < 9 && (f = !0),
                            (e.pos += t.length);
                        if (((e.trailingSpace = 32 == u.charCodeAt(t.length - 1)), r || n || i || f || s)) {
                            var w = r || "";
                            n && (w += n), i && (w += i);
                            var x = A("span", [c], w, s);
                            return o && (x.title = o), e.content.appendChild(x);
                        }
                        e.content.appendChild(c);
                    }
                }

                function Jt(e, t) {
                    return function(r, n, i, o, a, l, s) {
                        i = i ? i + " cm-force-border" : "cm-force-border";
                        for (var c = r.pos, u = c + n.length;;) {
                            for (
                                var d = void 0, f = 0; f < t.length && !((d = t[f]).to > c && d.from <= c); f++
                            );
                            if (d.to >= u) return e(r, n, i, o, a, l, s);
                            e(r, n.slice(0, d.to - c), i, o, null, l, s),
                                (o = null),
                                (n = n.slice(d.to - c)),
                                (c = d.to);
                        }
                    };
                }

                function er(e, t, r, n) {
                    var i = !n && r.widgetNode;
                    i && e.map.push(e.pos, e.pos + t, i), !n &&
                        e.cm.display.input.needsContentAttribute &&
                        (i || (i = e.content.appendChild(document.createElement("span"))),
                            i.setAttribute("cm-marker", r.id)),
                        i && (e.cm.display.input.setUneditable(i), e.content.appendChild(i)),
                        (e.pos += t),
                        (e.trailingSpace = !1);
                }

                function tr(e, t, r) {
                    var n = e.markedSpans,
                        i = e.text,
                        o = 0;
                    if (n)
                        for (var a, l, s, c, u, d, f, h = i.length, p = 0, m = 1, g = "", v = 0;;) {
                            if (v == p) {
                                (s = c = u = d = l = ""), (f = null), (v = 1 / 0);
                                for (var y = [], b = void 0, w = 0; w < n.length; ++w) {
                                    var x = n[w],
                                        k = x.marker;
                                    "bookmark" == k.type && x.from == p && k.widgetNode ?
                                        y.push(k) :
                                        x.from <= p &&
                                        (null == x.to ||
                                            x.to > p ||
                                            (k.collapsed && x.to == p && x.from == p)) ?
                                        (null != x.to && x.to != p && v > x.to && ((v = x.to), (c = "")),
                                            k.className && (s += " " + k.className),
                                            k.css && (l = (l ? l + ";" : "") + k.css),
                                            k.startStyle && x.from == p && (u += " " + k.startStyle),
                                            k.endStyle && x.to == v && (b || (b = [])).push(k.endStyle, x.to),
                                            k.title && !d && (d = k.title),
                                            k.collapsed && (!f || He(f.marker, k) < 0) && (f = x)) :
                                        x.from > p && v > x.from && (v = x.from);
                                }
                                if (b)
                                    for (var C = 0; C < b.length; C += 2) b[C + 1] == v && (c += " " + b[C]);
                                if (!f || f.from == p)
                                    for (var S = 0; S < y.length; ++S) er(t, 0, y[S]);
                                if (f && (f.from || 0) == p) {
                                    if (
                                        (er(t, (null == f.to ? h + 1 : f.to) - p, f.marker, null == f.from),
                                            null == f.to)
                                    )
                                        return;
                                    f.to == p && (f = !1);
                                }
                            }
                            if (p >= h) break;
                            for (var L = Math.min(h, v);;) {
                                if (g) {
                                    var M = p + g.length;
                                    if (!f) {
                                        var T = M > L ? g.slice(0, L - p) : g;
                                        t.addToken(t, T, a ? a + s : s, u, p + T.length == v ? c : "", d, l);
                                    }
                                    if (M >= L) {
                                        (g = g.slice(L - p)), (p = L);
                                        break;
                                    }
                                    (p = M), (u = "");
                                }
                                (g = i.slice(o, (o = r[m++]))), (a = Xt(r[m++], t.cm.options));
                            }
                        }
                    else
                        for (var O = 1; O < r.length; O += 2)
                            t.addToken(t, i.slice(o, (o = r[O])), Xt(r[O + 1], t.cm.options));
                }

                function rr(e, t, r) {
                    (this.line = t),
                    (this.rest = (function(e) {
                        for (var t, r;
                            (t = je(e));)(e = t.find(1, !0).line), (r || (r = [])).push(e);
                        return r;
                    })(t)),
                    (this.size = this.rest ? de(X(this.rest)) - r + 1 : 1),
                    (this.node = this.text = null),
                    (this.hidden = $e(e, t));
                }

                function nr(e, t, r) {
                    for (var n, i = [], o = t; o < r; o = n) {
                        var a = new rr(e.doc, le(e.doc, o), o);
                        (n = o + a.size), i.push(a);
                    }
                    return i;
                }
                var ir = null;
                var or = null;

                function ar(e, t) {
                    var r = et(e, t);
                    if (r.length) {
                        var n,
                            i = Array.prototype.slice.call(arguments, 2);
                        ir ? (n = ir.delayedCallbacks) : or ? (n = or) : ((n = or = []), setTimeout(lr, 0));
                        for (
                            var o = function(e) {
                                    n.push(function() {
                                        return r[e].apply(null, i);
                                    });
                                },
                                a = 0; a < r.length;
                            ++a
                        )
                            o(a);
                    }
                }

                function lr() {
                    var e = or;
                    or = null;
                    for (var t = 0; t < e.length; ++t) e[t]();
                }

                function sr(e, t, r, n) {
                    for (var i = 0; i < t.changes.length; i++) {
                        var o = t.changes[i];
                        "text" == o
                            ?
                            dr(e, t) :
                            "gutter" == o ?
                            hr(e, t, r, n) :
                            "class" == o ?
                            fr(e, t) :
                            "widget" == o && pr(e, t, n);
                    }
                    t.changes = null;
                }

                function cr(e) {
                    return (
                        e.node == e.text &&
                        ((e.node = A("div", null, null, "position: relative")),
                            e.text.parentNode && e.text.parentNode.replaceChild(e.node, e.text),
                            e.node.appendChild(e.text),
                            a && l < 8 && (e.node.style.zIndex = 2)),
                        e.node
                    );
                }

                function ur(e, t) {
                    var r = e.display.externalMeasured;
                    return r && r.line == t.line ?
                        ((e.display.externalMeasured = null), (t.measure = r.measure), r.built) :
                        Yt(e, t);
                }

                function dr(e, t) {
                    var r = t.text.className,
                        n = ur(e, t);
                    t.text == t.node && (t.node = n.pre),
                        t.text.parentNode.replaceChild(n.pre, t.text),
                        (t.text = n.pre),
                        n.bgClass != t.bgClass || n.textClass != t.textClass ?
                        ((t.bgClass = n.bgClass), (t.textClass = n.textClass), fr(e, t)) :
                        r && (t.text.className = r);
                }

                function fr(e, t) {
                    !(function(e, t) {
                        var r = t.bgClass ? t.bgClass + " " + (t.line.bgClass || "") : t.line.bgClass;
                        if ((r && (r += " CodeMirror-linebackground"), t.background))
                            r ?
                            (t.background.className = r) :
                            (t.background.parentNode.removeChild(t.background), (t.background = null));
                        else if (r) {
                            var n = cr(t);
                            (t.background = n.insertBefore(A("div", null, r), n.firstChild)),
                            e.display.input.setUneditable(t.background);
                        }
                    })(e, t),
                    t.line.wrapClass ?
                        (cr(t).className = t.line.wrapClass) :
                        t.node != t.text && (t.node.className = "");
                    var r = t.textClass ? t.textClass + " " + (t.line.textClass || "") : t.line.textClass;
                    t.text.className = r || "";
                }

                function hr(e, t, r, n) {
                    if (
                        (t.gutter && (t.node.removeChild(t.gutter), (t.gutter = null)),
                            t.gutterBackground &&
                            (t.node.removeChild(t.gutterBackground), (t.gutterBackground = null)),
                            t.line.gutterClass)
                    ) {
                        var i = cr(t);
                        (t.gutterBackground = A(
                            "div",
                            null,
                            "CodeMirror-gutter-background " + t.line.gutterClass,
                            "left: " +
                            (e.options.fixedGutter ? n.fixedPos : -n.gutterTotalWidth) +
                            "px; width: " +
                            n.gutterTotalWidth +
                            "px"
                        )),
                        e.display.input.setUneditable(t.gutterBackground),
                            i.insertBefore(t.gutterBackground, t.text);
                    }
                    var o = t.line.gutterMarkers;
                    if (e.options.lineNumbers || o) {
                        var a = cr(t),
                            l = (t.gutter = A(
                                "div",
                                null,
                                "CodeMirror-gutter-wrapper",
                                "left: " + (e.options.fixedGutter ? n.fixedPos : -n.gutterTotalWidth) + "px"
                            ));
                        if (
                            (e.display.input.setUneditable(l),
                                a.insertBefore(l, t.text),
                                t.line.gutterClass && (l.className += " " + t.line.gutterClass), !e.options.lineNumbers ||
                                (o && o["CodeMirror-linenumbers"]) ||
                                (t.lineNumber = l.appendChild(
                                    A(
                                        "div",
                                        pe(e.options, r),
                                        "CodeMirror-linenumber CodeMirror-gutter-elt",
                                        "left: " +
                                        n.gutterLeft["CodeMirror-linenumbers"] +
                                        "px; width: " +
                                        e.display.lineNumInnerWidth +
                                        "px"
                                    )
                                )),
                                o)
                        )
                            for (var s = 0; s < e.options.gutters.length; ++s) {
                                var c = e.options.gutters[s],
                                    u = o.hasOwnProperty(c) && o[c];
                                u &&
                                    l.appendChild(
                                        A(
                                            "div", [u],
                                            "CodeMirror-gutter-elt",
                                            "left: " +
                                            n.gutterLeft[c] +
                                            "px; width: " +
                                            n.gutterWidth[c] +
                                            "px"
                                        )
                                    );
                            }
                    }
                }

                function pr(e, t, r) {
                    t.alignable && (t.alignable = null);
                    for (var n = t.node.firstChild, i = void 0; n; n = i)
                        (i = n.nextSibling), "CodeMirror-linewidget" == n.className && t.node.removeChild(n);
                    gr(e, t, r);
                }

                function mr(e, t, r, n) {
                    var i = ur(e, t);
                    return (
                        (t.text = t.node = i.pre),
                        i.bgClass && (t.bgClass = i.bgClass),
                        i.textClass && (t.textClass = i.textClass),
                        fr(e, t),
                        hr(e, t, r, n),
                        gr(e, t, n),
                        t.node
                    );
                }

                function gr(e, t, r) {
                    if ((vr(e, t.line, t, r, !0), t.rest))
                        for (var n = 0; n < t.rest.length; n++) vr(e, t.rest[n], t, r, !1);
                }

                function vr(e, t, r, n, i) {
                    if (t.widgets)
                        for (var o = cr(r), a = 0, l = t.widgets; a < l.length; ++a) {
                            var s = l[a],
                                c = A("div", [s.node], "CodeMirror-linewidget");
                            s.handleMouseEvents || c.setAttribute("cm-ignore-events", "true"),
                                yr(s, c, r, n),
                                e.display.input.setUneditable(c),
                                i && s.above ? o.insertBefore(c, r.gutter || r.text) : o.appendChild(c),
                                ar(s, "redraw");
                        }
                }

                function yr(e, t, r, n) {
                    if (e.noHScroll) {
                        (r.alignable || (r.alignable = [])).push(t);
                        var i = n.wrapperWidth;
                        (t.style.left = n.fixedPos + "px"),
                        e.coverGutter ||
                            ((i -= n.gutterTotalWidth),
                                (t.style.paddingLeft = n.gutterTotalWidth + "px")),
                            (t.style.width = i + "px");
                    }
                    e.coverGutter &&
                        ((t.style.zIndex = 5),
                            (t.style.position = "relative"),
                            e.noHScroll || (t.style.marginLeft = -n.gutterTotalWidth + "px"));
                }

                function br(e) {
                    if (null != e.height) return e.height;
                    var t = e.doc.cm;
                    if (!t) return 0;
                    if (!N(document.body, e.node)) {
                        var r = "position: relative;";
                        e.coverGutter && (r += "margin-left: -" + t.display.gutters.offsetWidth + "px;"),
                            e.noHScroll && (r += "width: " + t.display.wrapper.clientWidth + "px;"),
                            O(t.display.measure, A("div", [e.node], null, r));
                    }
                    return (e.height = e.node.parentNode.offsetHeight);
                }

                function wr(e, t) {
                    for (var r = dt(t); r != e.wrapper; r = r.parentNode)
                        if (!r ||
                            (1 == r.nodeType && "true" == r.getAttribute("cm-ignore-events")) ||
                            (r.parentNode == e.sizer && r != e.mover)
                        )
                            return !0;
                }

                function xr(e) {
                    return e.lineSpace.offsetTop;
                }

                function kr(e) {
                    return e.mover.offsetHeight - e.lineSpace.offsetHeight;
                }

                function Cr(e) {
                    if (e.cachedPaddingH) return e.cachedPaddingH;
                    var t = O(e.measure, A("pre", "x")),
                        r = window.getComputedStyle ? window.getComputedStyle(t) : t.currentStyle,
                        n = { left: parseInt(r.paddingLeft), right: parseInt(r.paddingRight) };
                    return isNaN(n.left) || isNaN(n.right) || (e.cachedPaddingH = n), n;
                }

                function Sr(e) {
                    return _ - e.display.nativeBarWidth;
                }

                function Lr(e) {
                    return e.display.scroller.clientWidth - Sr(e) - e.display.barWidth;
                }

                function Mr(e) {
                    return e.display.scroller.clientHeight - Sr(e) - e.display.barHeight;
                }

                function Tr(e, t, r) {
                    if (e.line == t) return { map: e.measure.map, cache: e.measure.cache };
                    for (var n = 0; n < e.rest.length; n++)
                        if (e.rest[n] == t) return { map: e.measure.maps[n], cache: e.measure.caches[n] };
                    for (var i = 0; i < e.rest.length; i++)
                        if (de(e.rest[i]) > r)
                            return { map: e.measure.maps[i], cache: e.measure.caches[i], before: !0 };
                }

                function Or(e, t, r, n) {
                    return Nr(e, zr(e, t), r, n);
                }

                function Ar(e, t) {
                    if (t >= e.display.viewFrom && t < e.display.viewTo) return e.display.view[ln(e, t)];
                    var r = e.display.externalMeasured;
                    return r && t >= r.lineN && t < r.lineN + r.size ? r : void 0;
                }

                function zr(e, t) {
                    var r = de(t),
                        n = Ar(e, r);
                    n && !n.text ?
                        (n = null) :
                        n && n.changes && (sr(e, n, r, tn(e)), (e.curOp.forceUpdate = !0)),
                        n ||
                        (n = (function(e, t) {
                            var r = de((t = Re(t))),
                                n = (e.display.externalMeasured = new rr(e.doc, t, r));
                            n.lineN = r;
                            var i = (n.built = Yt(e, n));
                            return (n.text = i.pre), O(e.display.lineMeasure, i.pre), n;
                        })(e, t));
                    var i = Tr(n, t, r);
                    return {
                        line: t,
                        view: n,
                        rect: null,
                        map: i.map,
                        cache: i.cache,
                        before: i.before,
                        hasHeights: !1,
                    };
                }

                function Nr(e, t, r, n, i) {
                    t.before && (r = -1);
                    var o,
                        s = r + (n || "");
                    return (
                        t.cache.hasOwnProperty(s) ?
                        (o = t.cache[s]) :
                        (t.rect || (t.rect = t.view.text.getBoundingClientRect()),
                            t.hasHeights ||
                            (!(function(e, t, r) {
                                    var n = e.options.lineWrapping,
                                        i = n && Lr(e);
                                    if (!t.measure.heights || (n && t.measure.width != i)) {
                                        var o = (t.measure.heights = []);
                                        if (n) {
                                            t.measure.width = i;
                                            for (
                                                var a = t.text.firstChild.getClientRects(), l = 0; l < a.length - 1; l++
                                            ) {
                                                var s = a[l],
                                                    c = a[l + 1];
                                                Math.abs(s.bottom - c.bottom) > 2 &&
                                                    o.push((s.bottom + c.top) / 2 - r.top);
                                            }
                                        }
                                        o.push(r.bottom - r.top);
                                    }
                                })(e, t.view, t.rect),
                                (t.hasHeights = !0)),
                            (o = (function(e, t, r, n) {
                                var i,
                                    o = Pr(t.map, r, n),
                                    s = o.node,
                                    c = o.start,
                                    u = o.end,
                                    d = o.collapse;
                                if (3 == s.nodeType) {
                                    for (var f = 0; f < 4; f++) {
                                        for (; c && ie(t.line.text.charAt(o.coverStart + c));) --c;
                                        for (; o.coverStart + u < o.coverEnd &&
                                            ie(t.line.text.charAt(o.coverStart + u));

                                        )
                                            ++u;
                                        if (
                                            (i =
                                                a && l < 9 && 0 == c && u == o.coverEnd - o.coverStart ?
                                                s.parentNode.getBoundingClientRect() :
                                                Hr(L(s, c, u).getClientRects(), n)).left ||
                                            i.right ||
                                            0 == c
                                        )
                                            break;
                                        (u = c), (c -= 1), (d = "right");
                                    }
                                    a &&
                                        l < 11 &&
                                        (i = (function(e, t) {
                                            if (!window.screen ||
                                                null == screen.logicalXDPI ||
                                                screen.logicalXDPI == screen.deviceXDPI ||
                                                !(function(e) {
                                                    if (null != kt) return kt;
                                                    var t = O(e, A("span", "x")),
                                                        r = t.getBoundingClientRect(),
                                                        n = L(t, 0, 1).getBoundingClientRect();
                                                    return (kt = Math.abs(r.left - n.left) > 1);
                                                })(e)
                                            )
                                                return t;
                                            var r = screen.logicalXDPI / screen.deviceXDPI,
                                                n = screen.logicalYDPI / screen.deviceYDPI;
                                            return {
                                                left: t.left * r,
                                                right: t.right * r,
                                                top: t.top * n,
                                                bottom: t.bottom * n,
                                            };
                                        })(e.display.measure, i));
                                } else {
                                    var h;
                                    c > 0 && (d = n = "right"),
                                        (i =
                                            e.options.lineWrapping && (h = s.getClientRects()).length > 1 ?
                                            h["right" == n ? h.length - 1 : 0] :
                                            s.getBoundingClientRect());
                                }
                                if (a && l < 9 && !c && (!i || (!i.left && !i.right))) {
                                    var p = s.parentNode.getClientRects()[0];
                                    i = p ?
                                        {
                                            left: p.left,
                                            right: p.left + en(e.display),
                                            top: p.top,
                                            bottom: p.bottom,
                                        } :
                                        Wr;
                                }
                                for (
                                    var m = i.top - t.rect.top,
                                        g = i.bottom - t.rect.top,
                                        v = (m + g) / 2,
                                        y = t.view.measure.heights,
                                        b = 0; b < y.length - 1 && !(v < y[b]); b++
                                );
                                var w = b ? y[b - 1] : 0,
                                    x = y[b],
                                    k = {
                                        left: ("right" == d ? i.right : i.left) - t.rect.left,
                                        right: ("left" == d ? i.left : i.right) - t.rect.left,
                                        top: w,
                                        bottom: x,
                                    };
                                i.left || i.right || (k.bogus = !0);
                                e.options.singleCursorHeightPerLine || ((k.rtop = m), (k.rbottom = g));
                                return k;
                            })(e, t, r, n)).bogus || (t.cache[s] = o)), {
                            left: o.left,
                            right: o.right,
                            top: i ? o.rtop : o.top,
                            bottom: i ? o.rbottom : o.bottom,
                        }
                    );
                }
                var Er,
                    Wr = { left: 0, right: 0, top: 0, bottom: 0 };

                function Pr(e, t, r) {
                    for (var n, i, o, a, l, s, c = 0; c < e.length; c += 3)
                        if (
                            ((l = e[c]),
                                (s = e[c + 1]),
                                t < l ?
                                ((i = 0), (o = 1), (a = "left")) :
                                t < s ?
                                (o = (i = t - l) + 1) :
                                (c == e.length - 3 || (t == s && e[c + 3] > t)) &&
                                ((i = (o = s - l) - 1), t >= s && (a = "right")),
                                null != i)
                        ) {
                            if (
                                ((n = e[c + 2]),
                                    l == s && r == (n.insertLeft ? "left" : "right") && (a = r),
                                    "left" == r && 0 == i)
                            )
                                for (; c && e[c - 2] == e[c - 3] && e[c - 1].insertLeft;)
                                    (n = e[2 + (c -= 3)]), (a = "left");
                            if ("right" == r && i == s - l)
                                for (; c < e.length - 3 && e[c + 3] == e[c + 4] && !e[c + 5].insertLeft;)
                                    (n = e[(c += 3) + 2]), (a = "right");
                            break;
                        }
                    return { node: n, start: i, end: o, collapse: a, coverStart: l, coverEnd: s };
                }

                function Hr(e, t) {
                    var r = Wr;
                    if ("left" == t)
                        for (var n = 0; n < e.length && (r = e[n]).left == r.right; n++);
                    else
                        for (var i = e.length - 1; i >= 0 && (r = e[i]).left == r.right; i--);
                    return r;
                }

                function Dr(e) {
                    if (e.measure && ((e.measure.cache = {}), (e.measure.heights = null), e.rest))
                        for (var t = 0; t < e.rest.length; t++) e.measure.caches[t] = {};
                }

                function Ir(e) {
                    (e.display.externalMeasure = null), T(e.display.lineMeasure);
                    for (var t = 0; t < e.display.view.length; t++) Dr(e.display.view[t]);
                }

                function jr(e) {
                    Ir(e),
                        (e.display.cachedCharWidth = e.display.cachedTextHeight = e.display.cachedPaddingH = null),
                        e.options.lineWrapping || (e.display.maxLineChanged = !0),
                        (e.display.lineNumChars = null);
                }

                function Fr() {
                    return u && g ?
                        -(
                            document.body.getBoundingClientRect().left -
                            parseInt(getComputedStyle(document.body).marginLeft)
                        ) :
                        window.pageXOffset || (document.documentElement || document.body).scrollLeft;
                }

                function Rr() {
                    return u && g ?
                        -(
                            document.body.getBoundingClientRect().top -
                            parseInt(getComputedStyle(document.body).marginTop)
                        ) :
                        window.pageYOffset || (document.documentElement || document.body).scrollTop;
                }

                function _r(e) {
                    var t = 0;
                    if (e.widgets)
                        for (var r = 0; r < e.widgets.length; ++r)
                            e.widgets[r].above && (t += br(e.widgets[r]));
                    return t;
                }

                function Br(e, t, r, n, i) {
                    if (!i) {
                        var o = _r(t);
                        (r.top += o), (r.bottom += o);
                    }
                    if ("line" == n) return r;
                    n || (n = "local");
                    var a = Ue(t);
                    if (
                        ("local" == n ? (a += xr(e.display)) : (a -= e.display.viewOffset),
                            "page" == n || "window" == n)
                    ) {
                        var l = e.display.lineSpace.getBoundingClientRect();
                        a += l.top + ("window" == n ? 0 : Rr());
                        var s = l.left + ("window" == n ? 0 : Fr());
                        (r.left += s), (r.right += s);
                    }
                    return (r.top += a), (r.bottom += a), r;
                }

                function $r(e, t, r) {
                    if ("div" == r) return t;
                    var n = t.left,
                        i = t.top;
                    if ("page" == r)(n -= Fr()), (i -= Rr());
                    else if ("local" == r || !r) {
                        var o = e.display.sizer.getBoundingClientRect();
                        (n += o.left), (i += o.top);
                    }
                    var a = e.display.lineSpace.getBoundingClientRect();
                    return { left: n - a.left, top: i - a.top };
                }

                function qr(e, t, r, n, i) {
                    return n || (n = le(e.doc, t.line)), Br(e, n, Or(e, n, t.ch, i), r);
                }

                function Ur(e, t, r, n, i, o) {
                    function a(t, a) {
                        var l = Nr(e, i, t, a ? "right" : "left", o);
                        return a ? (l.left = l.right) : (l.right = l.left), Br(e, n, l, r);
                    }
                    (n = n || le(e.doc, t.line)), i || (i = zr(e, n));
                    var l = Ze(n, e.doc.direction),
                        s = t.ch,
                        c = t.sticky;
                    if (
                        (s >= n.text.length ?
                            ((s = n.text.length), (c = "before")) :
                            s <= 0 && ((s = 0), (c = "after")), !l)
                    )
                        return a("before" == c ? s - 1 : s, "before" == c);

                    function u(e, t, r) {
                        return a(r ? e - 1 : e, (1 == l[t].level) != r);
                    }
                    var d = Xe(l, s, c),
                        f = Ge,
                        h = u(s, d, "before" == c);
                    return null != f && (h.other = u(s, f, "before" != c)), h;
                }

                function Vr(e, t) {
                    var r = 0;
                    (t = ke(e.doc, t)), e.options.lineWrapping || (r = en(e.display) * t.ch);
                    var n = le(e.doc, t.line),
                        i = Ue(n) + xr(e.display);
                    return { left: r, right: r, top: i, bottom: i + n.height };
                }

                function Kr(e, t, r, n, i) {
                    var o = me(e, t, r);
                    return (o.xRel = i), n && (o.outside = !0), o;
                }

                function Gr(e, t, r) {
                    var n = e.doc;
                    if ((r += e.display.viewOffset) < 0) return Kr(n.first, 0, null, !0, -1);
                    var i = fe(n, r),
                        o = n.first + n.size - 1;
                    if (i > o) return Kr(n.first + n.size - 1, le(n, o).text.length, null, !0, 1);
                    t < 0 && (t = 0);
                    for (var a = le(n, i);;) {
                        var l = Qr(e, a, i, t, r),
                            s = je(a),
                            c = s && s.find(0, !0);
                        if (!s || !(l.ch > c.from.ch || (l.ch == c.from.ch && l.xRel > 0))) return l;
                        i = de((a = c.to.line));
                    }
                }

                function Xr(e, t, r, n) {
                    n -= _r(t);
                    var i = t.text.length,
                        o = ae(
                            function(t) {
                                return Nr(e, r, t - 1).bottom <= n;
                            },
                            i,
                            0
                        );
                    return {
                        begin: o,
                        end: (i = ae(
                            function(t) {
                                return Nr(e, r, t).top > n;
                            },
                            o,
                            i
                        )),
                    };
                }

                function Yr(e, t, r, n) {
                    return r || (r = zr(e, t)), Xr(e, t, r, Br(e, t, Nr(e, r, n), "line").top);
                }

                function Zr(e, t, r, n) {
                    return !(e.bottom <= r) && (e.top > r || (n ? e.left : e.right) > t);
                }

                function Qr(e, t, r, n, i) {
                    i -= Ue(t);
                    var o = zr(e, t),
                        a = _r(t),
                        l = 0,
                        s = t.text.length,
                        c = !0,
                        u = Ze(t, e.doc.direction);
                    if (u) {
                        var d = (e.options.lineWrapping ?

                            function(e, t, r, n, i, o, a) {
                                var l = Xr(e, t, n, a),
                                    s = l.begin,
                                    c = l.end;
                                /\s/.test(t.text.charAt(c - 1)) && c--;
                                for (var u = null, d = null, f = 0; f < i.length; f++) {
                                    var h = i[f];
                                    if (!(h.from >= c || h.to <= s)) {
                                        var p = 1 != h.level,
                                            m = Nr(e, n, p ? Math.min(c, h.to) - 1 : Math.max(s, h.from))
                                            .right,
                                            g = m < o ? o - m + 1e9 : m - o;
                                        (!u || d > g) && ((u = h), (d = g));
                                    }
                                }
                                u || (u = i[i.length - 1]);
                                u.from < s && (u = { from: s, to: u.to, level: u.level });
                                u.to > c && (u = { from: u.from, to: c, level: u.level });
                                return u;
                            } :
                            function(e, t, r, n, i, o, a) {
                                var l = ae(
                                        function(l) {
                                            var s = i[l],
                                                c = 1 != s.level;
                                            return Zr(
                                                Ur(
                                                    e,
                                                    me(r, c ? s.to : s.from, c ? "before" : "after"),
                                                    "line",
                                                    t,
                                                    n
                                                ),
                                                o,
                                                a, !0
                                            );
                                        },
                                        0,
                                        i.length - 1
                                    ),
                                    s = i[l];
                                if (l > 0) {
                                    var c = 1 != s.level,
                                        u = Ur(
                                            e,
                                            me(r, c ? s.from : s.to, c ? "after" : "before"),
                                            "line",
                                            t,
                                            n
                                        );
                                    Zr(u, o, a, !0) && u.top > a && (s = i[l - 1]);
                                }
                                return s;
                            })(e, t, r, o, u, n, i);
                        (l = (c = 1 != d.level) ? d.from : d.to - 1), (s = c ? d.to : d.from - 1);
                    }
                    var f,
                        h,
                        p = null,
                        m = null,
                        g = ae(
                            function(t) {
                                var r = Nr(e, o, t);
                                return (
                                    (r.top += a),
                                    (r.bottom += a), !!Zr(r, n, i, !1) && (r.top <= i && r.left <= n && ((p = t), (m = r)), !0)
                                );
                            },
                            l,
                            s
                        ),
                        v = !1;
                    if (m) {
                        var y = n - m.left < m.right - n,
                            b = y == c;
                        (g = p + (b ? 0 : 1)), (h = b ? "after" : "before"), (f = y ? m.left : m.right);
                    } else {
                        c || (g != s && g != l) || g++,
                            (h =
                                0 == g ?
                                "after" :
                                g == t.text.length ?
                                "before" :
                                Nr(e, o, g - (c ? 1 : 0)).bottom + a <= i == c ?
                                "after" :
                                "before");
                        var w = Ur(e, me(r, g, h), "line", t, o);
                        (f = w.left), (v = i < w.top || i >= w.bottom);
                    }
                    return Kr(r, (g = oe(t.text, g, 1)), h, v, n - f);
                }

                function Jr(e) {
                    if (null != e.cachedTextHeight) return e.cachedTextHeight;
                    if (null == Er) {
                        Er = A("pre");
                        for (var t = 0; t < 49; ++t)
                            Er.appendChild(document.createTextNode("x")), Er.appendChild(A("br"));
                        Er.appendChild(document.createTextNode("x"));
                    }
                    O(e.measure, Er);
                    var r = Er.offsetHeight / 50;
                    return r > 3 && (e.cachedTextHeight = r), T(e.measure), r || 1;
                }

                function en(e) {
                    if (null != e.cachedCharWidth) return e.cachedCharWidth;
                    var t = A("span", "xxxxxxxxxx"),
                        r = A("pre", [t]);
                    O(e.measure, r);
                    var n = t.getBoundingClientRect(),
                        i = (n.right - n.left) / 10;
                    return i > 2 && (e.cachedCharWidth = i), i || 10;
                }

                function tn(e) {
                    for (
                        var t = e.display,
                            r = {},
                            n = {},
                            i = t.gutters.clientLeft,
                            o = t.gutters.firstChild,
                            a = 0; o; o = o.nextSibling, ++a
                    )
                        (r[e.options.gutters[a]] = o.offsetLeft + o.clientLeft + i),
                        (n[e.options.gutters[a]] = o.clientWidth);
                    return {
                        fixedPos: rn(t),
                        gutterTotalWidth: t.gutters.offsetWidth,
                        gutterLeft: r,
                        gutterWidth: n,
                        wrapperWidth: t.wrapper.clientWidth,
                    };
                }

                function rn(e) {
                    return e.scroller.getBoundingClientRect().left - e.sizer.getBoundingClientRect().left;
                }

                function nn(e) {
                    var t = Jr(e.display),
                        r = e.options.lineWrapping,
                        n = r && Math.max(5, e.display.scroller.clientWidth / en(e.display) - 3);
                    return function(i) {
                        if ($e(e.doc, i)) return 0;
                        var o = 0;
                        if (i.widgets)
                            for (var a = 0; a < i.widgets.length; a++)
                                i.widgets[a].height && (o += i.widgets[a].height);
                        return r ? o + (Math.ceil(i.text.length / n) || 1) * t : o + t;
                    };
                }

                function on(e) {
                    var t = e.doc,
                        r = nn(e);
                    t.iter(function(e) {
                        var t = r(e);
                        t != e.height && ue(e, t);
                    });
                }

                function an(e, t, r, n) {
                    var i = e.display;
                    if (!r && "true" == dt(t).getAttribute("cm-not-content")) return null;
                    var o,
                        a,
                        l = i.lineSpace.getBoundingClientRect();
                    try {
                        (o = t.clientX - l.left), (a = t.clientY - l.top);
                    } catch (t) {
                        return null;
                    }
                    var s,
                        c = Gr(e, o, a);
                    if (n && 1 == c.xRel && (s = le(e.doc, c.line).text).length == c.ch) {
                        var u = j(s, s.length, e.options.tabSize) - s.length;
                        c = me(c.line, Math.max(0, Math.round((o - Cr(e.display).left) / en(e.display)) - u));
                    }
                    return c;
                }

                function ln(e, t) {
                    if (t >= e.display.viewTo) return null;
                    if ((t -= e.display.viewFrom) < 0) return null;
                    for (var r = e.display.view, n = 0; n < r.length; n++)
                        if ((t -= r[n].size) < 0) return n;
                }

                function sn(e) {
                    e.display.input.showSelection(e.display.input.prepareSelection());
                }

                function cn(e, t) {
                    void 0 === t && (t = !0);
                    for (
                        var r = e.doc,
                            n = {},
                            i = (n.cursors = document.createDocumentFragment()),
                            o = (n.selection = document.createDocumentFragment()),
                            a = 0; a < r.sel.ranges.length; a++
                    )
                        if (t || a != r.sel.primIndex) {
                            var l = r.sel.ranges[a];
                            if (!(l.from().line >= e.display.viewTo || l.to().line < e.display.viewFrom)) {
                                var s = l.empty();
                                (s || e.options.showCursorWhenSelecting) && un(e, l.head, i),
                                    s || fn(e, l, o);
                            }
                        }
                    return n;
                }

                function un(e, t, r) {
                    var n = Ur(e, t, "div", null, null, !e.options.singleCursorHeightPerLine),
                        i = r.appendChild(A("div", " ", "CodeMirror-cursor"));
                    if (
                        ((i.style.left = n.left + "px"),
                            (i.style.top = n.top + "px"),
                            (i.style.height = Math.max(0, n.bottom - n.top) * e.options.cursorHeight + "px"),
                            n.other)
                    ) {
                        var o = r.appendChild(A("div", " ", "CodeMirror-cursor CodeMirror-secondarycursor"));
                        (o.style.display = ""),
                        (o.style.left = n.other.left + "px"),
                        (o.style.top = n.other.top + "px"),
                        (o.style.height = 0.85 * (n.other.bottom - n.other.top) + "px");
                    }
                }

                function dn(e, t) {
                    return e.top - t.top || e.left - t.left;
                }

                function fn(e, t, r) {
                    var n = e.display,
                        i = e.doc,
                        o = document.createDocumentFragment(),
                        a = Cr(e.display),
                        l = a.left,
                        s = Math.max(n.sizerWidth, Lr(e) - n.sizer.offsetLeft) - a.right,
                        c = "ltr" == i.direction;

                    function u(e, t, r, n) {
                        t < 0 && (t = 0),
                            (t = Math.round(t)),
                            (n = Math.round(n)),
                            o.appendChild(
                                A(
                                    "div",
                                    null,
                                    "CodeMirror-selected",
                                    "position: absolute; left: " +
                                    e +
                                    "px;\n                             top: " +
                                    t +
                                    "px; width: " +
                                    (null == r ? s - e : r) +
                                    "px;\n                             height: " +
                                    (n - t) +
                                    "px"
                                )
                            );
                    }

                    function d(t, r, n) {
                        var o,
                            a,
                            d = le(i, t),
                            f = d.text.length;

                        function h(r, n) {
                            return qr(e, me(t, r), "div", d, n);
                        }

                        function p(t, r, n) {
                            var i = Yr(e, d, null, t),
                                o = ("ltr" == r) == ("after" == n) ? "left" : "right";
                            return h(
                                "after" == n ?
                                i.begin :
                                i.end - (/\s/.test(d.text.charAt(i.end - 1)) ? 2 : 1),
                                o
                            )[o];
                        }
                        var m = Ze(d, i.direction);
                        return (
                            (function(e, t, r, n) {
                                if (!e) return n(t, r, "ltr", 0);
                                for (var i = !1, o = 0; o < e.length; ++o) {
                                    var a = e[o];
                                    ((a.from < r && a.to > t) || (t == r && a.to == t)) &&
                                    (n(
                                            Math.max(a.from, t),
                                            Math.min(a.to, r),
                                            1 == a.level ? "rtl" : "ltr",
                                            o
                                        ),
                                        (i = !0));
                                }
                                i || n(t, r, "ltr");
                            })(m, r || 0, null == n ? f : n, function(e, t, i, d) {
                                var g = "ltr" == i,
                                    v = h(e, g ? "left" : "right"),
                                    y = h(t - 1, g ? "right" : "left"),
                                    b = null == r && 0 == e,
                                    w = null == n && t == f,
                                    x = 0 == d,
                                    k = !m || d == m.length - 1;
                                if (y.top - v.top <= 3) {
                                    var C = (c ? w : b) && k,
                                        S = (c ? b : w) && x ? l : (g ? v : y).left,
                                        L = C ? s : (g ? y : v).right;
                                    u(S, v.top, L - S, v.bottom);
                                } else {
                                    var M, T, O, A;
                                    g
                                        ?
                                        ((M = c && b && x ? l : v.left),
                                            (T = c ? s : p(e, i, "before")),
                                            (O = c ? l : p(t, i, "after")),
                                            (A = c && w && k ? s : y.right)) :
                                        ((M = c ? p(e, i, "before") : l),
                                            (T = !c && b && x ? s : v.right),
                                            (O = !c && w && k ? l : y.left),
                                            (A = c ? p(t, i, "after") : s)),
                                        u(M, v.top, T - M, v.bottom),
                                        v.bottom < y.top && u(l, v.bottom, null, y.top),
                                        u(O, y.top, A - O, y.bottom);
                                }
                                (!o || dn(v, o) < 0) && (o = v),
                                dn(y, o) < 0 && (o = y),
                                    (!a || dn(v, a) < 0) && (a = v),
                                    dn(y, a) < 0 && (a = y);
                            }), { start: o, end: a }
                        );
                    }
                    var f = t.from(),
                        h = t.to();
                    if (f.line == h.line) d(f.line, f.ch, h.ch);
                    else {
                        var p = le(i, f.line),
                            m = le(i, h.line),
                            g = Re(p) == Re(m),
                            v = d(f.line, f.ch, g ? p.text.length + 1 : null).end,
                            y = d(h.line, g ? 0 : null, h.ch).start;
                        g &&
                            (v.top < y.top - 2 ?
                                (u(v.right, v.top, null, v.bottom), u(l, y.top, y.left, y.bottom)) :
                                u(v.right, v.top, y.left - v.right, v.bottom)),
                            v.bottom < y.top && u(l, v.bottom, null, y.top);
                    }
                    r.appendChild(o);
                }

                function hn(e) {
                    if (e.state.focused) {
                        var t = e.display;
                        clearInterval(t.blinker);
                        var r = !0;
                        (t.cursorDiv.style.visibility = ""),
                        e.options.cursorBlinkRate > 0 ?
                            (t.blinker = setInterval(function() {
                                return (t.cursorDiv.style.visibility = (r = !r) ? "" : "hidden");
                            }, e.options.cursorBlinkRate)) :
                            e.options.cursorBlinkRate < 0 && (t.cursorDiv.style.visibility = "hidden");
                    }
                }

                function pn(e) {
                    e.state.focused || (e.display.input.focus(), gn(e));
                }

                function mn(e) {
                    (e.state.delayingBlurEvent = !0),
                    setTimeout(function() {
                        e.state.delayingBlurEvent && ((e.state.delayingBlurEvent = !1), vn(e));
                    }, 100);
                }

                function gn(e, t) {
                    e.state.delayingBlurEvent && (e.state.delayingBlurEvent = !1),
                        "nocursor" != e.options.readOnly &&
                        (e.state.focused ||
                            (rt(e, "focus", e, t),
                                (e.state.focused = !0),
                                W(e.display.wrapper, "CodeMirror-focused"),
                                e.curOp ||
                                e.display.selForContextMenu == e.doc.sel ||
                                (e.display.input.reset(),
                                    s &&
                                    setTimeout(function() {
                                        return e.display.input.reset(!0);
                                    }, 20)),
                                e.display.input.receivedFocus()),
                            hn(e));
                }

                function vn(e, t) {
                    e.state.delayingBlurEvent ||
                        (e.state.focused &&
                            (rt(e, "blur", e, t),
                                (e.state.focused = !1),
                                M(e.display.wrapper, "CodeMirror-focused")),
                            clearInterval(e.display.blinker),
                            setTimeout(function() {
                                e.state.focused || (e.display.shift = !1);
                            }, 150));
                }

                function yn(e) {
                    for (var t = e.display, r = t.lineDiv.offsetTop, n = 0; n < t.view.length; n++) {
                        var i = t.view[n],
                            o = void 0;
                        if (!i.hidden) {
                            if (a && l < 8) {
                                var s = i.node.offsetTop + i.node.offsetHeight;
                                (o = s - r), (r = s);
                            } else {
                                var c = i.node.getBoundingClientRect();
                                o = c.bottom - c.top;
                            }
                            var u = i.line.height - o;
                            if (
                                (o < 2 && (o = Jr(t)),
                                    (u > 0.005 || u < -0.005) && (ue(i.line, o), bn(i.line), i.rest))
                            )
                                for (var d = 0; d < i.rest.length; d++) bn(i.rest[d]);
                        }
                    }
                }

                function bn(e) {
                    if (e.widgets)
                        for (var t = 0; t < e.widgets.length; ++t) {
                            var r = e.widgets[t],
                                n = r.node.parentNode;
                            n && (r.height = n.offsetHeight);
                        }
                }

                function wn(e, t, r) {
                    var n = r && null != r.top ? Math.max(0, r.top) : e.scroller.scrollTop;
                    n = Math.floor(n - xr(e));
                    var i = r && null != r.bottom ? r.bottom : n + e.wrapper.clientHeight,
                        o = fe(t, n),
                        a = fe(t, i);
                    if (r && r.ensure) {
                        var l = r.ensure.from.line,
                            s = r.ensure.to.line;
                        l < o ?
                            ((o = l), (a = fe(t, Ue(le(t, l)) + e.wrapper.clientHeight))) :
                            Math.min(s, t.lastLine()) >= a &&
                            ((o = fe(t, Ue(le(t, s)) - e.wrapper.clientHeight)), (a = s));
                    }
                    return { from: o, to: Math.max(a, o + 1) };
                }

                function xn(e) {
                    var t = e.display,
                        r = t.view;
                    if (t.alignWidgets || (t.gutters.firstChild && e.options.fixedGutter)) {
                        for (
                            var n = rn(t) - t.scroller.scrollLeft + e.doc.scrollLeft,
                                i = t.gutters.offsetWidth,
                                o = n + "px",
                                a = 0; a < r.length; a++
                        )
                            if (!r[a].hidden) {
                                e.options.fixedGutter &&
                                    (r[a].gutter && (r[a].gutter.style.left = o),
                                        r[a].gutterBackground && (r[a].gutterBackground.style.left = o));
                                var l = r[a].alignable;
                                if (l)
                                    for (var s = 0; s < l.length; s++) l[s].style.left = o;
                            }
                        e.options.fixedGutter && (t.gutters.style.left = n + i + "px");
                    }
                }

                function kn(e) {
                    if (!e.options.lineNumbers) return !1;
                    var t = e.doc,
                        r = pe(e.options, t.first + t.size - 1),
                        n = e.display;
                    if (r.length != n.lineNumChars) {
                        var i = n.measure.appendChild(
                                A("div", [A("div", r)], "CodeMirror-linenumber CodeMirror-gutter-elt")
                            ),
                            o = i.firstChild.offsetWidth,
                            a = i.offsetWidth - o;
                        return (
                            (n.lineGutter.style.width = ""),
                            (n.lineNumInnerWidth = Math.max(o, n.lineGutter.offsetWidth - a) + 1),
                            (n.lineNumWidth = n.lineNumInnerWidth + a),
                            (n.lineNumChars = n.lineNumInnerWidth ? r.length : -1),
                            (n.lineGutter.style.width = n.lineNumWidth + "px"),
                            li(e), !0
                        );
                    }
                    return !1;
                }

                function Cn(e, t) {
                    var r = e.display,
                        n = Jr(e.display);
                    t.top < 0 && (t.top = 0);
                    var i = e.curOp && null != e.curOp.scrollTop ? e.curOp.scrollTop : r.scroller.scrollTop,
                        o = Mr(e),
                        a = {};
                    t.bottom - t.top > o && (t.bottom = t.top + o);
                    var l = e.doc.height + kr(r),
                        s = t.top < n,
                        c = t.bottom > l - n;
                    if (t.top < i) a.scrollTop = s ? 0 : t.top;
                    else if (t.bottom > i + o) {
                        var u = Math.min(t.top, (c ? l : t.bottom) - o);
                        u != i && (a.scrollTop = u);
                    }
                    var d =
                        e.curOp && null != e.curOp.scrollLeft ?
                        e.curOp.scrollLeft :
                        r.scroller.scrollLeft,
                        f = Lr(e) - (e.options.fixedGutter ? r.gutters.offsetWidth : 0),
                        h = t.right - t.left > f;
                    return (
                        h && (t.right = t.left + f),
                        t.left < 10 ?
                        (a.scrollLeft = 0) :
                        t.left < d ?
                        (a.scrollLeft = Math.max(0, t.left - (h ? 0 : 10))) :
                        t.right > f + d - 3 && (a.scrollLeft = t.right + (h ? 0 : 10) - f),
                        a
                    );
                }

                function Sn(e, t) {
                    null != t &&
                        (Tn(e),
                            (e.curOp.scrollTop =
                                (null == e.curOp.scrollTop ? e.doc.scrollTop : e.curOp.scrollTop) + t));
                }

                function Ln(e) {
                    Tn(e);
                    var t = e.getCursor();
                    e.curOp.scrollToPos = { from: t, to: t, margin: e.options.cursorScrollMargin };
                }

                function Mn(e, t, r) {
                    (null == t && null == r) || Tn(e),
                        null != t && (e.curOp.scrollLeft = t),
                        null != r && (e.curOp.scrollTop = r);
                }

                function Tn(e) {
                    var t = e.curOp.scrollToPos;
                    t && ((e.curOp.scrollToPos = null), On(e, Vr(e, t.from), Vr(e, t.to), t.margin));
                }

                function On(e, t, r, n) {
                    var i = Cn(e, {
                        left: Math.min(t.left, r.left),
                        top: Math.min(t.top, r.top) - n,
                        right: Math.max(t.right, r.right),
                        bottom: Math.max(t.bottom, r.bottom) + n,
                    });
                    Mn(e, i.scrollLeft, i.scrollTop);
                }

                function An(e, t) {
                    Math.abs(e.doc.scrollTop - t) < 2 ||
                        (r || ai(e, { top: t }), zn(e, t, !0), r && ai(e), ti(e, 100));
                }

                function zn(e, t, r) {
                    (t = Math.min(e.display.scroller.scrollHeight - e.display.scroller.clientHeight, t)),
                    (e.display.scroller.scrollTop != t || r) &&
                    ((e.doc.scrollTop = t),
                        e.display.scrollbars.setScrollTop(t),
                        e.display.scroller.scrollTop != t && (e.display.scroller.scrollTop = t));
                }

                function Nn(e, t, r, n) {
                    (t = Math.min(t, e.display.scroller.scrollWidth - e.display.scroller.clientWidth)),
                    ((r ? t == e.doc.scrollLeft : Math.abs(e.doc.scrollLeft - t) < 2) && !n) ||
                    ((e.doc.scrollLeft = t),
                        xn(e),
                        e.display.scroller.scrollLeft != t && (e.display.scroller.scrollLeft = t),
                        e.display.scrollbars.setScrollLeft(t));
                }

                function En(e) {
                    var t = e.display,
                        r = t.gutters.offsetWidth,
                        n = Math.round(e.doc.height + kr(e.display));
                    return {
                        clientHeight: t.scroller.clientHeight,
                        viewHeight: t.wrapper.clientHeight,
                        scrollWidth: t.scroller.scrollWidth,
                        clientWidth: t.scroller.clientWidth,
                        viewWidth: t.wrapper.clientWidth,
                        barLeft: e.options.fixedGutter ? r : 0,
                        docHeight: n,
                        scrollHeight: n + Sr(e) + t.barHeight,
                        nativeBarWidth: t.nativeBarWidth,
                        gutterWidth: r,
                    };
                }
                var Wn = function(e, t, r) {
                    this.cm = r;
                    var n = (this.vert = A(
                            "div", [A("div", null, null, "min-width: 1px")],
                            "CodeMirror-vscrollbar"
                        )),
                        i = (this.horiz = A(
                            "div", [A("div", null, null, "height: 100%; min-height: 1px")],
                            "CodeMirror-hscrollbar"
                        ));
                    e(n),
                        e(i),
                        Je(n, "scroll", function() {
                            n.clientHeight && t(n.scrollTop, "vertical");
                        }),
                        Je(i, "scroll", function() {
                            i.clientWidth && t(i.scrollLeft, "horizontal");
                        }),
                        (this.checkedZeroWidth = !1),
                        a && l < 8 && (this.horiz.style.minHeight = this.vert.style.minWidth = "18px");
                };
                (Wn.prototype.update = function(e) {
                    var t = e.scrollWidth > e.clientWidth + 1,
                        r = e.scrollHeight > e.clientHeight + 1,
                        n = e.nativeBarWidth;
                    if (r) {
                        (this.vert.style.display = "block"), (this.vert.style.bottom = t ? n + "px" : "0");
                        var i = e.viewHeight - (t ? n : 0);
                        this.vert.firstChild.style.height =
                            Math.max(0, e.scrollHeight - e.clientHeight + i) + "px";
                    } else(this.vert.style.display = ""), (this.vert.firstChild.style.height = "0");
                    if (t) {
                        (this.horiz.style.display = "block"),
                        (this.horiz.style.right = r ? n + "px" : "0"),
                        (this.horiz.style.left = e.barLeft + "px");
                        var o = e.viewWidth - e.barLeft - (r ? n : 0);
                        this.horiz.firstChild.style.width =
                            Math.max(0, e.scrollWidth - e.clientWidth + o) + "px";
                    } else(this.horiz.style.display = ""), (this.horiz.firstChild.style.width = "0");
                    return (!this.checkedZeroWidth &&
                        e.clientHeight > 0 &&
                        (0 == n && this.zeroWidthHack(), (this.checkedZeroWidth = !0)), { right: r ? n : 0, bottom: t ? n : 0 }
                    );
                }),
                (Wn.prototype.setScrollLeft = function(e) {
                    this.horiz.scrollLeft != e && (this.horiz.scrollLeft = e),
                        this.disableHoriz &&
                        this.enableZeroWidthBar(this.horiz, this.disableHoriz, "horiz");
                }),
                (Wn.prototype.setScrollTop = function(e) {
                    this.vert.scrollTop != e && (this.vert.scrollTop = e),
                        this.disableVert && this.enableZeroWidthBar(this.vert, this.disableVert, "vert");
                }),
                (Wn.prototype.zeroWidthHack = function() {
                    var e = y && !h ? "12px" : "18px";
                    (this.horiz.style.height = this.vert.style.width = e),
                    (this.horiz.style.pointerEvents = this.vert.style.pointerEvents = "none"),
                    (this.disableHoriz = new F()),
                    (this.disableVert = new F());
                }),
                (Wn.prototype.enableZeroWidthBar = function(e, t, r) {
                    (e.style.pointerEvents = "auto"),
                    t.set(1e3, function n() {
                        var i = e.getBoundingClientRect();
                        ("vert" == r ?
                            document.elementFromPoint(i.right - 1, (i.top + i.bottom) / 2) :
                            document.elementFromPoint((i.right + i.left) / 2, i.bottom - 1)) != e
                            ?
                            (e.style.pointerEvents = "none") :
                            t.set(1e3, n);
                    });
                }),
                (Wn.prototype.clear = function() {
                    var e = this.horiz.parentNode;
                    e.removeChild(this.horiz), e.removeChild(this.vert);
                });
                var Pn = function() {};

                function Hn(e, t) {
                    t || (t = En(e));
                    var r = e.display.barWidth,
                        n = e.display.barHeight;
                    Dn(e, t);
                    for (var i = 0;
                        (i < 4 && r != e.display.barWidth) || n != e.display.barHeight; i++)
                        r != e.display.barWidth && e.options.lineWrapping && yn(e),
                        Dn(e, En(e)),
                        (r = e.display.barWidth),
                        (n = e.display.barHeight);
                }

                function Dn(e, t) {
                    var r = e.display,
                        n = r.scrollbars.update(t);
                    (r.sizer.style.paddingRight = (r.barWidth = n.right) + "px"),
                    (r.sizer.style.paddingBottom = (r.barHeight = n.bottom) + "px"),
                    (r.heightForcer.style.borderBottom = n.bottom + "px solid transparent"),
                    n.right && n.bottom ?
                        ((r.scrollbarFiller.style.display = "block"),
                            (r.scrollbarFiller.style.height = n.bottom + "px"),
                            (r.scrollbarFiller.style.width = n.right + "px")) :
                        (r.scrollbarFiller.style.display = ""),
                        n.bottom && e.options.coverGutterNextToScrollbar && e.options.fixedGutter ?
                        ((r.gutterFiller.style.display = "block"),
                            (r.gutterFiller.style.height = n.bottom + "px"),
                            (r.gutterFiller.style.width = t.gutterWidth + "px")) :
                        (r.gutterFiller.style.display = "");
                }
                (Pn.prototype.update = function() {
                    return { bottom: 0, right: 0 };
                }),
                (Pn.prototype.setScrollLeft = function() {}),
                (Pn.prototype.setScrollTop = function() {}),
                (Pn.prototype.clear = function() {});
                var In = { native: Wn, null: Pn };

                function jn(e) {
                    e.display.scrollbars &&
                        (e.display.scrollbars.clear(),
                            e.display.scrollbars.addClass && M(e.display.wrapper, e.display.scrollbars.addClass)),
                        (e.display.scrollbars = new In[e.options.scrollbarStyle](
                            function(t) {
                                e.display.wrapper.insertBefore(t, e.display.scrollbarFiller),
                                    Je(t, "mousedown", function() {
                                        e.state.focused &&
                                            setTimeout(function() {
                                                return e.display.input.focus();
                                            }, 0);
                                    }),
                                    t.setAttribute("cm-not-content", "true");
                            },
                            function(t, r) {
                                "horizontal" == r ? Nn(e, t) : An(e, t);
                            },
                            e
                        )),
                        e.display.scrollbars.addClass && W(e.display.wrapper, e.display.scrollbars.addClass);
                }
                var Fn = 0;

                function Rn(e) {
                    var t;
                    (e.curOp = {
                        cm: e,
                        viewChanged: !1,
                        startHeight: e.doc.height,
                        forceUpdate: !1,
                        updateInput: null,
                        typing: !1,
                        changeObjs: null,
                        cursorActivityHandlers: null,
                        cursorActivityCalled: 0,
                        selectionChanged: !1,
                        updateMaxLine: !1,
                        scrollLeft: null,
                        scrollTop: null,
                        scrollToPos: null,
                        focus: !1,
                        id: ++Fn,
                    }),
                    (t = e.curOp),
                    ir ? ir.ops.push(t) : (t.ownsGroup = ir = { ops: [t], delayedCallbacks: [] });
                }

                function _n(e) {
                    !(function(e, t) {
                        var r = e.ownsGroup;
                        if (r)
                            try {
                                !(function(e) {
                                    var t = e.delayedCallbacks,
                                        r = 0;
                                    do {
                                        for (; r < t.length; r++) t[r].call(null);
                                        for (var n = 0; n < e.ops.length; n++) {
                                            var i = e.ops[n];
                                            if (i.cursorActivityHandlers)
                                                for (; i.cursorActivityCalled < i.cursorActivityHandlers.length;

                                                )
                                                    i.cursorActivityHandlers[i.cursorActivityCalled++].call(
                                                        null,
                                                        i.cm
                                                    );
                                        }
                                    } while (r < t.length);
                                })(r);
                            } finally {
                                (ir = null), t(r);
                            }
                    })(e.curOp, function(e) {
                        for (var t = 0; t < e.ops.length; t++) e.ops[t].cm.curOp = null;
                        !(function(e) {
                            for (var t = e.ops, r = 0; r < t.length; r++) Bn(t[r]);
                            for (var n = 0; n < t.length; n++)
                                (i = t[n]).updatedDisplay = i.mustUpdate && ii(i.cm, i.update);
                            var i;
                            for (var o = 0; o < t.length; o++) $n(t[o]);
                            for (var a = 0; a < t.length; a++) qn(t[a]);
                            for (var l = 0; l < t.length; l++) Un(t[l]);
                        })(e);
                    });
                }

                function Bn(e) {
                    var t = e.cm,
                        r = t.display;
                    !(function(e) {
                        var t = e.display;
                        !t.scrollbarsClipped &&
                            t.scroller.offsetWidth &&
                            ((t.nativeBarWidth = t.scroller.offsetWidth - t.scroller.clientWidth),
                                (t.heightForcer.style.height = Sr(e) + "px"),
                                (t.sizer.style.marginBottom = -t.nativeBarWidth + "px"),
                                (t.sizer.style.borderRightWidth = Sr(e) + "px"),
                                (t.scrollbarsClipped = !0));
                    })(t),
                    e.updateMaxLine && Ke(t),
                        (e.mustUpdate =
                            e.viewChanged ||
                            e.forceUpdate ||
                            null != e.scrollTop ||
                            (e.scrollToPos &&
                                (e.scrollToPos.from.line < r.viewFrom ||
                                    e.scrollToPos.to.line >= r.viewTo)) ||
                            (r.maxLineChanged && t.options.lineWrapping)),
                        (e.update =
                            e.mustUpdate &&
                            new ni(
                                t,
                                e.mustUpdate && { top: e.scrollTop, ensure: e.scrollToPos },
                                e.forceUpdate
                            ));
                }

                function $n(e) {
                    var t = e.cm,
                        r = t.display;
                    e.updatedDisplay && yn(t),
                        (e.barMeasure = En(t)),
                        r.maxLineChanged &&
                        !t.options.lineWrapping &&
                        ((e.adjustWidthTo = Or(t, r.maxLine, r.maxLine.text.length).left + 3),
                            (t.display.sizerWidth = e.adjustWidthTo),
                            (e.barMeasure.scrollWidth = Math.max(
                                r.scroller.clientWidth,
                                r.sizer.offsetLeft + e.adjustWidthTo + Sr(t) + t.display.barWidth
                            )),
                            (e.maxScrollLeft = Math.max(0, r.sizer.offsetLeft + e.adjustWidthTo - Lr(t)))),
                        (e.updatedDisplay || e.selectionChanged) &&
                        (e.preparedSelection = r.input.prepareSelection());
                }

                function qn(e) {
                    var t = e.cm;
                    null != e.adjustWidthTo &&
                        ((t.display.sizer.style.minWidth = e.adjustWidthTo + "px"),
                            e.maxScrollLeft < t.doc.scrollLeft &&
                            Nn(t, Math.min(t.display.scroller.scrollLeft, e.maxScrollLeft), !0),
                            (t.display.maxLineChanged = !1));
                    var r = e.focus && e.focus == E();
                    e.preparedSelection && t.display.input.showSelection(e.preparedSelection, r),
                        (e.updatedDisplay || e.startHeight != t.doc.height) && Hn(t, e.barMeasure),
                        e.updatedDisplay && si(t, e.barMeasure),
                        e.selectionChanged && hn(t),
                        t.state.focused && e.updateInput && t.display.input.reset(e.typing),
                        r && pn(e.cm);
                }

                function Un(e) {
                    var t = e.cm,
                        r = t.display,
                        n = t.doc;
                    (e.updatedDisplay && oi(t, e.update),
                        null == r.wheelStartX ||
                        (null == e.scrollTop && null == e.scrollLeft && !e.scrollToPos) ||
                        (r.wheelStartX = r.wheelStartY = null),
                        null != e.scrollTop && zn(t, e.scrollTop, e.forceScroll),
                        null != e.scrollLeft && Nn(t, e.scrollLeft, !0, !0),
                        e.scrollToPos) &&
                    (function(e, t) {
                        if (!nt(e, "scrollCursorIntoView")) {
                            var r = e.display,
                                n = r.sizer.getBoundingClientRect(),
                                i = null;
                            if (
                                (t.top + n.top < 0 ?
                                    (i = !0) :
                                    t.bottom + n.top >
                                    (window.innerHeight || document.documentElement.clientHeight) &&
                                    (i = !1),
                                    null != i && !p)
                            ) {
                                var o = A(
                                    "div",
                                    "​",
                                    null,
                                    "position: absolute;\n                         top: " +
                                    (t.top - r.viewOffset - xr(e.display)) +
                                    "px;\n                         height: " +
                                    (t.bottom - t.top + Sr(e) + r.barHeight) +
                                    "px;\n                         left: " +
                                    t.left +
                                    "px; width: " +
                                    Math.max(2, t.right - t.left) +
                                    "px;"
                                );
                                e.display.lineSpace.appendChild(o),
                                    o.scrollIntoView(i),
                                    e.display.lineSpace.removeChild(o);
                            }
                        }
                    })(
                        t,
                        (function(e, t, r, n) {
                            var i;
                            null == n && (n = 0),
                                e.options.lineWrapping ||
                                t != r ||
                                (r =
                                    "before" ==
                                    (t = t.ch ?
                                        me(t.line, "before" == t.sticky ? t.ch - 1 : t.ch, "after") :
                                        t).sticky ?
                                    me(t.line, t.ch + 1, "before") :
                                    t);
                            for (var o = 0; o < 5; o++) {
                                var a = !1,
                                    l = Ur(e, t),
                                    s = r && r != t ? Ur(e, r) : l,
                                    c = Cn(
                                        e,
                                        (i = {
                                            left: Math.min(l.left, s.left),
                                            top: Math.min(l.top, s.top) - n,
                                            right: Math.max(l.left, s.left),
                                            bottom: Math.max(l.bottom, s.bottom) + n,
                                        })
                                    ),
                                    u = e.doc.scrollTop,
                                    d = e.doc.scrollLeft;
                                if (
                                    (null != c.scrollTop &&
                                        (An(e, c.scrollTop),
                                            Math.abs(e.doc.scrollTop - u) > 1 && (a = !0)),
                                        null != c.scrollLeft &&
                                        (Nn(e, c.scrollLeft),
                                            Math.abs(e.doc.scrollLeft - d) > 1 && (a = !0)), !a)
                                )
                                    break;
                            }
                            return i;
                        })(t, ke(n, e.scrollToPos.from), ke(n, e.scrollToPos.to), e.scrollToPos.margin)
                    );
                    var i = e.maybeHiddenMarkers,
                        o = e.maybeUnhiddenMarkers;
                    if (i)
                        for (var a = 0; a < i.length; ++a) i[a].lines.length || rt(i[a], "hide");
                    if (o)
                        for (var l = 0; l < o.length; ++l) o[l].lines.length && rt(o[l], "unhide");
                    r.wrapper.offsetHeight && (n.scrollTop = t.display.scroller.scrollTop),
                        e.changeObjs && rt(t, "changes", t, e.changeObjs),
                        e.update && e.update.finish();
                }

                function Vn(e, t) {
                    if (e.curOp) return t();
                    Rn(e);
                    try {
                        return t();
                    } finally {
                        _n(e);
                    }
                }

                function Kn(e, t) {
                    return function() {
                        if (e.curOp) return t.apply(e, arguments);
                        Rn(e);
                        try {
                            return t.apply(e, arguments);
                        } finally {
                            _n(e);
                        }
                    };
                }

                function Gn(e) {
                    return function() {
                        if (this.curOp) return e.apply(this, arguments);
                        Rn(this);
                        try {
                            return e.apply(this, arguments);
                        } finally {
                            _n(this);
                        }
                    };
                }

                function Xn(e) {
                    return function() {
                        var t = this.cm;
                        if (!t || t.curOp) return e.apply(this, arguments);
                        Rn(t);
                        try {
                            return e.apply(this, arguments);
                        } finally {
                            _n(t);
                        }
                    };
                }

                function Yn(e, t, r, n) {
                    null == t && (t = e.doc.first), null == r && (r = e.doc.first + e.doc.size), n || (n = 0);
                    var i = e.display;
                    if (
                        (n &&
                            r < i.viewTo &&
                            (null == i.updateLineNumbers || i.updateLineNumbers > t) &&
                            (i.updateLineNumbers = t),
                            (e.curOp.viewChanged = !0),
                            t >= i.viewTo)
                    )
                        Le && _e(e.doc, t) < i.viewTo && Qn(e);
                    else if (r <= i.viewFrom)
                        Le && Be(e.doc, r + n) > i.viewFrom ? Qn(e) : ((i.viewFrom += n), (i.viewTo += n));
                    else if (t <= i.viewFrom && r >= i.viewTo) Qn(e);
                    else if (t <= i.viewFrom) {
                        var o = Jn(e, r, r + n, 1);
                        o
                            ?
                            ((i.view = i.view.slice(o.index)), (i.viewFrom = o.lineN), (i.viewTo += n)) :
                            Qn(e);
                    } else if (r >= i.viewTo) {
                        var a = Jn(e, t, t, -1);
                        a ? ((i.view = i.view.slice(0, a.index)), (i.viewTo = a.lineN)) : Qn(e);
                    } else {
                        var l = Jn(e, t, t, -1),
                            s = Jn(e, r, r + n, 1);
                        l && s ?
                            ((i.view = i.view
                                    .slice(0, l.index)
                                    .concat(nr(e, l.lineN, s.lineN))
                                    .concat(i.view.slice(s.index))),
                                (i.viewTo += n)) :
                            Qn(e);
                    }
                    var c = i.externalMeasured;
                    c && (r < c.lineN ? (c.lineN += n) : t < c.lineN + c.size && (i.externalMeasured = null));
                }

                function Zn(e, t, r) {
                    e.curOp.viewChanged = !0;
                    var n = e.display,
                        i = e.display.externalMeasured;
                    if (
                        (i && t >= i.lineN && t < i.lineN + i.size && (n.externalMeasured = null), !(t < n.viewFrom || t >= n.viewTo))
                    ) {
                        var o = n.view[ln(e, t)];
                        if (null != o.node) {
                            var a = o.changes || (o.changes = []); -
                            1 == R(a, r) && a.push(r);
                        }
                    }
                }

                function Qn(e) {
                    (e.display.viewFrom = e.display.viewTo = e.doc.first),
                    (e.display.view = []),
                    (e.display.viewOffset = 0);
                }

                function Jn(e, t, r, n) {
                    var i,
                        o = ln(e, t),
                        a = e.display.view;
                    if (!Le || r == e.doc.first + e.doc.size) return { index: o, lineN: r };
                    for (var l = e.display.viewFrom, s = 0; s < o; s++) l += a[s].size;
                    if (l != t) {
                        if (n > 0) {
                            if (o == a.length - 1) return null;
                            (i = l + a[o].size - t), o++;
                        } else i = l - t;
                        (t += i), (r += i);
                    }
                    for (; _e(e.doc, r) != r;) {
                        if (o == (n < 0 ? 0 : a.length - 1)) return null;
                        (r += n * a[o - (n < 0 ? 1 : 0)].size), (o += n);
                    }
                    return { index: o, lineN: r };
                }

                function ei(e) {
                    for (var t = e.display.view, r = 0, n = 0; n < t.length; n++) {
                        var i = t[n];
                        i.hidden || (i.node && !i.changes) || ++r;
                    }
                    return r;
                }

                function ti(e, t) {
                    e.doc.highlightFrontier < e.display.viewTo && e.state.highlight.set(t, D(ri, e));
                }

                function ri(e) {
                    var t = e.doc;
                    if (!(t.highlightFrontier >= e.display.viewTo)) {
                        var r = +new Date() + e.options.workTime,
                            n = It(e, t.highlightFrontier),
                            i = [];
                        t.iter(n.line, Math.min(t.first + t.size, e.display.viewTo + 500), function(o) {
                                if (n.line >= e.display.viewFrom) {
                                    var a = o.styles,
                                        l =
                                        o.text.length > e.options.maxHighlightLength ?
                                        At(t.mode, n.state) :
                                        null,
                                        s = Ht(e, o, n, !0);
                                    l && (n.state = l), (o.styles = s.styles);
                                    var c = o.styleClasses,
                                        u = s.classes;
                                    u ? (o.styleClasses = u) : c && (o.styleClasses = null);
                                    for (
                                        var d = !a ||
                                            a.length != o.styles.length ||
                                            (c != u &&
                                                (!c ||
                                                    !u ||
                                                    c.bgClass != u.bgClass ||
                                                    c.textClass != u.textClass)),
                                            f = 0; !d && f < a.length;
                                        ++f
                                    )
                                        d = a[f] != o.styles[f];
                                    d && i.push(n.line), (o.stateAfter = n.save()), n.nextLine();
                                } else o.text.length <= e.options.maxHighlightLength && jt(e, o.text, n), (o.stateAfter = n.line % 5 == 0 ? n.save() : null), n.nextLine();
                                if (+new Date() > r) return ti(e, e.options.workDelay), !0;
                            }),
                            (t.highlightFrontier = n.line),
                            (t.modeFrontier = Math.max(t.modeFrontier, n.line)),
                            i.length &&
                            Vn(e, function() {
                                for (var t = 0; t < i.length; t++) Zn(e, i[t], "text");
                            });
                    }
                }
                var ni = function(e, t, r) {
                    var n = e.display;
                    (this.viewport = t),
                    (this.visible = wn(n, e.doc, t)),
                    (this.editorIsHidden = !n.wrapper.offsetWidth),
                    (this.wrapperHeight = n.wrapper.clientHeight),
                    (this.wrapperWidth = n.wrapper.clientWidth),
                    (this.oldDisplayWidth = Lr(e)),
                    (this.force = r),
                    (this.dims = tn(e)),
                    (this.events = []);
                };

                function ii(e, t) {
                    var r = e.display,
                        n = e.doc;
                    if (t.editorIsHidden) return Qn(e), !1;
                    if (!t.force &&
                        t.visible.from >= r.viewFrom &&
                        t.visible.to <= r.viewTo &&
                        (null == r.updateLineNumbers || r.updateLineNumbers >= r.viewTo) &&
                        r.renderedView == r.view &&
                        0 == ei(e)
                    )
                        return !1;
                    kn(e) && (Qn(e), (t.dims = tn(e)));
                    var i = n.first + n.size,
                        o = Math.max(t.visible.from - e.options.viewportMargin, n.first),
                        a = Math.min(i, t.visible.to + e.options.viewportMargin);
                    r.viewFrom < o && o - r.viewFrom < 20 && (o = Math.max(n.first, r.viewFrom)),
                        r.viewTo > a && r.viewTo - a < 20 && (a = Math.min(i, r.viewTo)),
                        Le && ((o = _e(e.doc, o)), (a = Be(e.doc, a)));
                    var l =
                        o != r.viewFrom ||
                        a != r.viewTo ||
                        r.lastWrapHeight != t.wrapperHeight ||
                        r.lastWrapWidth != t.wrapperWidth;
                    !(function(e, t, r) {
                        var n = e.display;
                        0 == n.view.length || t >= n.viewTo || r <= n.viewFrom ?
                            ((n.view = nr(e, t, r)), (n.viewFrom = t)) :
                            (n.viewFrom > t ?
                                (n.view = nr(e, t, n.viewFrom).concat(n.view)) :
                                n.viewFrom < t && (n.view = n.view.slice(ln(e, t))),
                                (n.viewFrom = t),
                                n.viewTo < r ?
                                (n.view = n.view.concat(nr(e, n.viewTo, r))) :
                                n.viewTo > r && (n.view = n.view.slice(0, ln(e, r)))),
                            (n.viewTo = r);
                    })(e, o, a),
                    (r.viewOffset = Ue(le(e.doc, r.viewFrom))),
                    (e.display.mover.style.top = r.viewOffset + "px");
                    var c = ei(e);
                    if (!l &&
                        0 == c &&
                        !t.force &&
                        r.renderedView == r.view &&
                        (null == r.updateLineNumbers || r.updateLineNumbers >= r.viewTo)
                    )
                        return !1;
                    var u = (function(e) {
                        if (e.hasFocus()) return null;
                        var t = E();
                        if (!t || !N(e.display.lineDiv, t)) return null;
                        var r = { activeElt: t };
                        if (window.getSelection) {
                            var n = window.getSelection();
                            n.anchorNode &&
                                n.extend &&
                                N(e.display.lineDiv, n.anchorNode) &&
                                ((r.anchorNode = n.anchorNode),
                                    (r.anchorOffset = n.anchorOffset),
                                    (r.focusNode = n.focusNode),
                                    (r.focusOffset = n.focusOffset));
                        }
                        return r;
                    })(e);
                    return (
                        c > 4 && (r.lineDiv.style.display = "none"),
                        (function(e, t, r) {
                            var n = e.display,
                                i = e.options.lineNumbers,
                                o = n.lineDiv,
                                a = o.firstChild;

                            function l(t) {
                                var r = t.nextSibling;
                                return (
                                    s && y && e.display.currentWheelTarget == t ?
                                    (t.style.display = "none") :
                                    t.parentNode.removeChild(t),
                                    r
                                );
                            }
                            for (var c = n.view, u = n.viewFrom, d = 0; d < c.length; d++) {
                                var f = c[d];
                                if (f.hidden);
                                else if (f.node && f.node.parentNode == o) {
                                    for (; a != f.node;) a = l(a);
                                    var h = i && null != t && t <= u && f.lineNumber;
                                    f.changes && (R(f.changes, "gutter") > -1 && (h = !1), sr(e, f, u, r)),
                                        h &&
                                        (T(f.lineNumber),
                                            f.lineNumber.appendChild(
                                                document.createTextNode(pe(e.options, u))
                                            )),
                                        (a = f.node.nextSibling);
                                } else {
                                    var p = mr(e, f, u, r);
                                    o.insertBefore(p, a);
                                }
                                u += f.size;
                            }
                            for (; a;) a = l(a);
                        })(e, r.updateLineNumbers, t.dims),
                        c > 4 && (r.lineDiv.style.display = ""),
                        (r.renderedView = r.view),
                        (function(e) {
                            if (
                                e &&
                                e.activeElt &&
                                e.activeElt != E() &&
                                (e.activeElt.focus(),
                                    e.anchorNode &&
                                    N(document.body, e.anchorNode) &&
                                    N(document.body, e.focusNode))
                            ) {
                                var t = window.getSelection(),
                                    r = document.createRange();
                                r.setEnd(e.anchorNode, e.anchorOffset),
                                    r.collapse(!1),
                                    t.removeAllRanges(),
                                    t.addRange(r),
                                    t.extend(e.focusNode, e.focusOffset);
                            }
                        })(u),
                        T(r.cursorDiv),
                        T(r.selectionDiv),
                        (r.gutters.style.height = r.sizer.style.minHeight = 0),
                        l &&
                        ((r.lastWrapHeight = t.wrapperHeight),
                            (r.lastWrapWidth = t.wrapperWidth),
                            ti(e, 400)),
                        (r.updateLineNumbers = null), !0
                    );
                }

                function oi(e, t) {
                    for (
                        var r = t.viewport, n = !0;
                        ((n && e.options.lineWrapping && t.oldDisplayWidth != Lr(e)) ||
                            (r &&
                                null != r.top &&
                                (r = { top: Math.min(e.doc.height + kr(e.display) - Mr(e), r.top) }),
                                (t.visible = wn(e.display, e.doc, r)), !(t.visible.from >= e.display.viewFrom && t.visible.to <= e.display.viewTo))) &&
                        ii(e, t); n = !1
                    ) {
                        yn(e);
                        var i = En(e);
                        sn(e), Hn(e, i), si(e, i), (t.force = !1);
                    }
                    t.signal(e, "update", e),
                        (e.display.viewFrom == e.display.reportedViewFrom &&
                            e.display.viewTo == e.display.reportedViewTo) ||
                        (t.signal(e, "viewportChange", e, e.display.viewFrom, e.display.viewTo),
                            (e.display.reportedViewFrom = e.display.viewFrom),
                            (e.display.reportedViewTo = e.display.viewTo));
                }

                function ai(e, t) {
                    var r = new ni(e, t);
                    if (ii(e, r)) {
                        yn(e), oi(e, r);
                        var n = En(e);
                        sn(e), Hn(e, n), si(e, n), r.finish();
                    }
                }

                function li(e) {
                    var t = e.display.gutters.offsetWidth;
                    e.display.sizer.style.marginLeft = t + "px";
                }

                function si(e, t) {
                    (e.display.sizer.style.minHeight = t.docHeight + "px"),
                    (e.display.heightForcer.style.top = t.docHeight + "px"),
                    (e.display.gutters.style.height = t.docHeight + e.display.barHeight + Sr(e) + "px");
                }

                function ci(e) {
                    var t = e.display.gutters,
                        r = e.options.gutters;
                    T(t);
                    for (var n = 0; n < r.length; ++n) {
                        var i = r[n],
                            o = t.appendChild(A("div", null, "CodeMirror-gutter " + i));
                        "CodeMirror-linenumbers" == i &&
                            ((e.display.lineGutter = o),
                                (o.style.width = (e.display.lineNumWidth || 1) + "px"));
                    }
                    (t.style.display = n ? "" : "none"), li(e);
                }

                function ui(e) {
                    var t = R(e.gutters, "CodeMirror-linenumbers"); -
                    1 == t && e.lineNumbers ?
                        (e.gutters = e.gutters.concat(["CodeMirror-linenumbers"])) :
                        t > -1 &&
                        !e.lineNumbers &&
                        ((e.gutters = e.gutters.slice(0)), e.gutters.splice(t, 1));
                }
                (ni.prototype.signal = function(e, t) {
                    ot(e, t) && this.events.push(arguments);
                }),
                (ni.prototype.finish = function() {
                    for (var e = 0; e < this.events.length; e++) rt.apply(null, this.events[e]);
                });
                var di = 0,
                    fi = null;

                function hi(e) {
                    var t = e.wheelDeltaX,
                        r = e.wheelDeltaY;
                    return (
                        null == t && e.detail && e.axis == e.HORIZONTAL_AXIS && (t = e.detail),
                        null == r && e.detail && e.axis == e.VERTICAL_AXIS ?
                        (r = e.detail) :
                        null == r && (r = e.wheelDelta), { x: t, y: r }
                    );
                }

                function pi(e) {
                    var t = hi(e);
                    return (t.x *= fi), (t.y *= fi), t;
                }

                function mi(e, t) {
                    var n = hi(t),
                        i = n.x,
                        o = n.y,
                        a = e.display,
                        l = a.scroller,
                        c = l.scrollWidth > l.clientWidth,
                        u = l.scrollHeight > l.clientHeight;
                    if ((i && c) || (o && u)) {
                        if (o && y && s)
                            e: for (var f = t.target, h = a.view; f != l; f = f.parentNode)
                                for (var p = 0; p < h.length; p++)
                                    if (h[p].node == f) {
                                        e.display.currentWheelTarget = f;
                                        break e;
                                    }
                        if (i && !r && !d && null != fi)
                            return (
                                o && u && An(e, Math.max(0, l.scrollTop + o * fi)),
                                Nn(e, Math.max(0, l.scrollLeft + i * fi)),
                                (!o || (o && u)) && lt(t),
                                void(a.wheelStartX = null)
                            );
                        if (o && null != fi) {
                            var m = o * fi,
                                g = e.doc.scrollTop,
                                v = g + a.wrapper.clientHeight;
                            m < 0 ? (g = Math.max(0, g + m - 50)) : (v = Math.min(e.doc.height, v + m + 50)),
                                ai(e, { top: g, bottom: v });
                        }
                        di < 20 &&
                            (null == a.wheelStartX ?
                                ((a.wheelStartX = l.scrollLeft),
                                    (a.wheelStartY = l.scrollTop),
                                    (a.wheelDX = i),
                                    (a.wheelDY = o),
                                    setTimeout(function() {
                                        if (null != a.wheelStartX) {
                                            var e = l.scrollLeft - a.wheelStartX,
                                                t = l.scrollTop - a.wheelStartY,
                                                r =
                                                (t && a.wheelDY && t / a.wheelDY) ||
                                                (e && a.wheelDX && e / a.wheelDX);
                                            (a.wheelStartX = a.wheelStartY = null),
                                            r && ((fi = (fi * di + r) / (di + 1)), ++di);
                                        }
                                    }, 200)) :
                                ((a.wheelDX += i), (a.wheelDY += o)));
                    }
                }
                a ? (fi = -0.53) : r ? (fi = 15) : u ? (fi = -0.7) : f && (fi = -1 / 3);
                var gi = function(e, t) {
                    (this.ranges = e), (this.primIndex = t);
                };
                (gi.prototype.primary = function() {
                    return this.ranges[this.primIndex];
                }),
                (gi.prototype.equals = function(e) {
                    if (e == this) return !0;
                    if (e.primIndex != this.primIndex || e.ranges.length != this.ranges.length) return !1;
                    for (var t = 0; t < this.ranges.length; t++) {
                        var r = this.ranges[t],
                            n = e.ranges[t];
                        if (!ve(r.anchor, n.anchor) || !ve(r.head, n.head)) return !1;
                    }
                    return !0;
                }),
                (gi.prototype.deepCopy = function() {
                    for (var e = [], t = 0; t < this.ranges.length; t++)
                        e[t] = new vi(ye(this.ranges[t].anchor), ye(this.ranges[t].head));
                    return new gi(e, this.primIndex);
                }),
                (gi.prototype.somethingSelected = function() {
                    for (var e = 0; e < this.ranges.length; e++)
                        if (!this.ranges[e].empty()) return !0;
                    return !1;
                }),
                (gi.prototype.contains = function(e, t) {
                    t || (t = e);
                    for (var r = 0; r < this.ranges.length; r++) {
                        var n = this.ranges[r];
                        if (ge(t, n.from()) >= 0 && ge(e, n.to()) <= 0) return r;
                    }
                    return -1;
                });
                var vi = function(e, t) {
                    (this.anchor = e), (this.head = t);
                };

                function yi(e, t) {
                    var r = e[t];
                    e.sort(function(e, t) {
                            return ge(e.from(), t.from());
                        }),
                        (t = R(e, r));
                    for (var n = 1; n < e.length; n++) {
                        var i = e[n],
                            o = e[n - 1];
                        if (ge(o.to(), i.from()) >= 0) {
                            var a = we(o.from(), i.from()),
                                l = be(o.to(), i.to()),
                                s = o.empty() ? i.from() == i.head : o.from() == o.head;
                            n <= t && --t, e.splice(--n, 2, new vi(s ? l : a, s ? a : l));
                        }
                    }
                    return new gi(e, t);
                }

                function bi(e, t) {
                    return new gi([new vi(e, t || e)], 0);
                }

                function wi(e) {
                    return e.text ?
                        me(
                            e.from.line + e.text.length - 1,
                            X(e.text).length + (1 == e.text.length ? e.from.ch : 0)
                        ) :
                        e.to;
                }

                function xi(e, t) {
                    if (ge(e, t.from) < 0) return e;
                    if (ge(e, t.to) <= 0) return wi(t);
                    var r = e.line + t.text.length - (t.to.line - t.from.line) - 1,
                        n = e.ch;
                    return e.line == t.to.line && (n += wi(t).ch - t.to.ch), me(r, n);
                }

                function ki(e, t) {
                    for (var r = [], n = 0; n < e.sel.ranges.length; n++) {
                        var i = e.sel.ranges[n];
                        r.push(new vi(xi(i.anchor, t), xi(i.head, t)));
                    }
                    return yi(r, e.sel.primIndex);
                }

                function Ci(e, t, r) {
                    return e.line == t.line ?
                        me(r.line, e.ch - t.ch + r.ch) :
                        me(r.line + (e.line - t.line), e.ch);
                }

                function Si(e) {
                    (e.doc.mode = Mt(e.options, e.doc.modeOption)), Li(e);
                }

                function Li(e) {
                    e.doc.iter(function(e) {
                            e.stateAfter && (e.stateAfter = null), e.styles && (e.styles = null);
                        }),
                        (e.doc.modeFrontier = e.doc.highlightFrontier = e.doc.first),
                        ti(e, 100),
                        e.state.modeGen++,
                        e.curOp && Yn(e);
                }

                function Mi(e, t) {
                    return (
                        0 == t.from.ch &&
                        0 == t.to.ch &&
                        "" == X(t.text) &&
                        (!e.cm || e.cm.options.wholeLineUpdateBefore)
                    );
                }

                function Ti(e, t, r, n) {
                    function i(e) {
                        return r ? r[e] : null;
                    }

                    function o(e, r, i) {
                        !(function(e, t, r, n) {
                            (e.text = t),
                            e.stateAfter && (e.stateAfter = null),
                                e.styles && (e.styles = null),
                                null != e.order && (e.order = null),
                                Ne(e),
                                Ee(e, r);
                            var i = n ? n(e) : 1;
                            i != e.height && ue(e, i);
                        })(e, r, i, n),
                        ar(e, "change", e, t);
                    }

                    function a(e, t) {
                        for (var r = [], o = e; o < t; ++o) r.push(new Ut(c[o], i(o), n));
                        return r;
                    }
                    var l = t.from,
                        s = t.to,
                        c = t.text,
                        u = le(e, l.line),
                        d = le(e, s.line),
                        f = X(c),
                        h = i(c.length - 1),
                        p = s.line - l.line;
                    if (t.full) e.insert(0, a(0, c.length)), e.remove(c.length, e.size - c.length);
                    else if (Mi(e, t)) {
                        var m = a(0, c.length - 1);
                        o(d, d.text, h), p && e.remove(l.line, p), m.length && e.insert(l.line, m);
                    } else if (u == d)
                        if (1 == c.length) o(u, u.text.slice(0, l.ch) + f + u.text.slice(s.ch), h);
                        else {
                            var g = a(1, c.length - 1);
                            g.push(new Ut(f + u.text.slice(s.ch), h, n)),
                                o(u, u.text.slice(0, l.ch) + c[0], i(0)),
                                e.insert(l.line + 1, g);
                        }
                    else if (1 == c.length)
                        o(u, u.text.slice(0, l.ch) + c[0] + d.text.slice(s.ch), i(0)),
                        e.remove(l.line + 1, p);
                    else {
                        o(u, u.text.slice(0, l.ch) + c[0], i(0)), o(d, f + d.text.slice(s.ch), h);
                        var v = a(1, c.length - 1);
                        p > 1 && e.remove(l.line + 1, p - 1), e.insert(l.line + 1, v);
                    }
                    ar(e, "change", e, t);
                }

                function Oi(e, t, r) {
                    !(function e(n, i, o) {
                        if (n.linked)
                            for (var a = 0; a < n.linked.length; ++a) {
                                var l = n.linked[a];
                                if (l.doc != i) {
                                    var s = o && l.sharedHist;
                                    (r && !s) || (t(l.doc, s), e(l.doc, n, s));
                                }
                            }
                    })(e, null, !0);
                }

                function Ai(e, t) {
                    if (t.cm) throw new Error("This document is already in use.");
                    (e.doc = t),
                    (t.cm = e),
                    on(e),
                        Si(e),
                        zi(e),
                        e.options.lineWrapping || Ke(e),
                        (e.options.mode = t.modeOption),
                        Yn(e);
                }

                function zi(e) {
                    ("rtl" == e.doc.direction ? W : M)(e.display.lineDiv, "CodeMirror-rtl");
                }

                function Ni(e) {
                    (this.done = []),
                    (this.undone = []),
                    (this.undoDepth = 1 / 0),
                    (this.lastModTime = this.lastSelTime = 0),
                    (this.lastOp = this.lastSelOp = null),
                    (this.lastOrigin = this.lastSelOrigin = null),
                    (this.generation = this.maxGeneration = e || 1);
                }

                function Ei(e, t) {
                    var r = { from: ye(t.from), to: wi(t), text: se(e, t.from, t.to) };
                    return (
                        Ii(e, r, t.from.line, t.to.line + 1),
                        Oi(
                            e,
                            function(e) {
                                return Ii(e, r, t.from.line, t.to.line + 1);
                            }, !0
                        ),
                        r
                    );
                }

                function Wi(e) {
                    for (; e.length;) {
                        if (!X(e).ranges) break;
                        e.pop();
                    }
                }

                function Pi(e, t, r, n) {
                    var i = e.history;
                    i.undone.length = 0;
                    var o,
                        a,
                        l = +new Date();
                    if (
                        (i.lastOp == n ||
                            (i.lastOrigin == t.origin &&
                                t.origin &&
                                (("+" == t.origin.charAt(0) &&
                                        e.cm &&
                                        i.lastModTime > l - e.cm.options.historyEventDelay) ||
                                    "*" == t.origin.charAt(0)))) &&
                        (o = (function(e, t) {
                            return t ?
                                (Wi(e.done), X(e.done)) :
                                e.done.length && !X(e.done).ranges ?
                                X(e.done) :
                                e.done.length > 1 && !e.done[e.done.length - 2].ranges ?
                                (e.done.pop(), X(e.done)) :
                                void 0;
                        })(i, i.lastOp == n))
                    )
                        (a = X(o.changes)),
                        0 == ge(t.from, t.to) && 0 == ge(t.from, a.to) ?
                        (a.to = wi(t)) :
                        o.changes.push(Ei(e, t));
                    else {
                        var s = X(i.done);
                        for (
                            (s && s.ranges) || Di(e.sel, i.done),
                            o = { changes: [Ei(e, t)], generation: i.generation },
                            i.done.push(o); i.done.length > i.undoDepth;

                        )
                            i.done.shift(), i.done[0].ranges || i.done.shift();
                    }
                    i.done.push(r),
                        (i.generation = ++i.maxGeneration),
                        (i.lastModTime = i.lastSelTime = l),
                        (i.lastOp = i.lastSelOp = n),
                        (i.lastOrigin = i.lastSelOrigin = t.origin),
                        a || rt(e, "historyAdded");
                }

                function Hi(e, t, r, n) {
                    var i = e.history,
                        o = n && n.origin;
                    r == i.lastSelOp ||
                        (o &&
                            i.lastSelOrigin == o &&
                            ((i.lastModTime == i.lastSelTime && i.lastOrigin == o) ||
                                (function(e, t, r, n) {
                                    var i = t.charAt(0);
                                    return (
                                        "*" == i ||
                                        ("+" == i &&
                                            r.ranges.length == n.ranges.length &&
                                            r.somethingSelected() == n.somethingSelected() &&
                                            new Date() - e.history.lastSelTime <=
                                            (e.cm ? e.cm.options.historyEventDelay : 500))
                                    );
                                })(e, o, X(i.done), t))) ?
                        (i.done[i.done.length - 1] = t) :
                        Di(t, i.done),
                        (i.lastSelTime = +new Date()),
                        (i.lastSelOrigin = o),
                        (i.lastSelOp = r),
                        n && !1 !== n.clearRedo && Wi(i.undone);
                }

                function Di(e, t) {
                    var r = X(t);
                    (r && r.ranges && r.equals(e)) || t.push(e);
                }

                function Ii(e, t, r, n) {
                    var i = t["spans_" + e.id],
                        o = 0;
                    e.iter(Math.max(e.first, r), Math.min(e.first + e.size, n), function(r) {
                        r.markedSpans && ((i || (i = t["spans_" + e.id] = {}))[o] = r.markedSpans), ++o;
                    });
                }

                function ji(e) {
                    if (!e) return null;
                    for (var t, r = 0; r < e.length; ++r)
                        e[r].marker.explicitlyCleared ? t || (t = e.slice(0, r)) : t && t.push(e[r]);
                    return t ? (t.length ? t : null) : e;
                }

                function Fi(e, t) {
                    var r = (function(e, t) {
                            var r = t["spans_" + e.id];
                            if (!r) return null;
                            for (var n = [], i = 0; i < t.text.length; ++i) n.push(ji(r[i]));
                            return n;
                        })(e, t),
                        n = Ae(e, t);
                    if (!r) return n;
                    if (!n) return r;
                    for (var i = 0; i < r.length; ++i) {
                        var o = r[i],
                            a = n[i];
                        if (o && a)
                            e: for (var l = 0; l < a.length; ++l) {
                                for (var s = a[l], c = 0; c < o.length; ++c)
                                    if (o[c].marker == s.marker) continue e;
                                o.push(s);
                            }
                        else a && (r[i] = a);
                    }
                    return r;
                }

                function Ri(e, t, r) {
                    for (var n = [], i = 0; i < e.length; ++i) {
                        var o = e[i];
                        if (o.ranges) n.push(r ? gi.prototype.deepCopy.call(o) : o);
                        else {
                            var a = o.changes,
                                l = [];
                            n.push({ changes: l });
                            for (var s = 0; s < a.length; ++s) {
                                var c = a[s],
                                    u = void 0;
                                if ((l.push({ from: c.from, to: c.to, text: c.text }), t))
                                    for (var d in c)
                                        (u = d.match(/^spans_(\d+)$/)) &&
                                        R(t, Number(u[1])) > -1 &&
                                        ((X(l)[d] = c[d]), delete c[d]);
                            }
                        }
                    }
                    return n;
                }

                function _i(e, t, r, n) {
                    if (n) {
                        var i = e.anchor;
                        if (r) {
                            var o = ge(t, i) < 0;
                            o != ge(r, i) < 0 ? ((i = t), (t = r)) : o != ge(t, r) < 0 && (t = r);
                        }
                        return new vi(i, t);
                    }
                    return new vi(r || t, t);
                }

                function Bi(e, t, r, n, i) {
                    null == i && (i = e.cm && (e.cm.display.shift || e.extend)),
                        Ki(e, new gi([_i(e.sel.primary(), t, r, i)], 0), n);
                }

                function $i(e, t, r) {
                    for (
                        var n = [], i = e.cm && (e.cm.display.shift || e.extend), o = 0; o < e.sel.ranges.length; o++
                    )
                        n[o] = _i(e.sel.ranges[o], t[o], null, i);
                    Ki(e, yi(n, e.sel.primIndex), r);
                }

                function qi(e, t, r, n) {
                    var i = e.sel.ranges.slice(0);
                    (i[t] = r), Ki(e, yi(i, e.sel.primIndex), n);
                }

                function Ui(e, t, r, n) {
                    Ki(e, bi(t, r), n);
                }

                function Vi(e, t, r) {
                    var n = e.history.done,
                        i = X(n);
                    i && i.ranges ? ((n[n.length - 1] = t), Gi(e, t, r)) : Ki(e, t, r);
                }

                function Ki(e, t, r) {
                    Gi(e, t, r), Hi(e, e.sel, e.cm ? e.cm.curOp.id : NaN, r);
                }

                function Gi(e, t, r) {
                    (ot(e, "beforeSelectionChange") || (e.cm && ot(e.cm, "beforeSelectionChange"))) &&
                    (t = (function(e, t, r) {
                        var n = {
                            ranges: t.ranges,
                            update: function(t) {
                                this.ranges = [];
                                for (var r = 0; r < t.length; r++)
                                    this.ranges[r] = new vi(ke(e, t[r].anchor), ke(e, t[r].head));
                            },
                            origin: r && r.origin,
                        };
                        return (
                            rt(e, "beforeSelectionChange", e, n),
                            e.cm && rt(e.cm, "beforeSelectionChange", e.cm, n),
                            n.ranges != t.ranges ? yi(n.ranges, n.ranges.length - 1) : t
                        );
                    })(e, t, r)),
                    Xi(
                            e,
                            Zi(
                                e,
                                t,
                                (r && r.bias) || (ge(t.primary().head, e.sel.primary().head) < 0 ? -1 : 1), !0
                            )
                        ),
                        (r && !1 === r.scroll) || !e.cm || Ln(e.cm);
                }

                function Xi(e, t) {
                    t.equals(e.sel) ||
                        ((e.sel = t),
                            e.cm && ((e.cm.curOp.updateInput = e.cm.curOp.selectionChanged = !0), it(e.cm)),
                            ar(e, "cursorActivity", e));
                }

                function Yi(e) {
                    Xi(e, Zi(e, e.sel, null, !1));
                }

                function Zi(e, t, r, n) {
                    for (var i, o = 0; o < t.ranges.length; o++) {
                        var a = t.ranges[o],
                            l = t.ranges.length == e.sel.ranges.length && e.sel.ranges[o],
                            s = Ji(e, a.anchor, l && l.anchor, r, n),
                            c = Ji(e, a.head, l && l.head, r, n);
                        (i || s != a.anchor || c != a.head) &&
                        (i || (i = t.ranges.slice(0, o)), (i[o] = new vi(s, c)));
                    }
                    return i ? yi(i, t.primIndex) : t;
                }

                function Qi(e, t, r, n, i) {
                    var o = le(e, t.line);
                    if (o.markedSpans)
                        for (var a = 0; a < o.markedSpans.length; ++a) {
                            var l = o.markedSpans[a],
                                s = l.marker;
                            if (
                                (null == l.from || (s.inclusiveLeft ? l.from <= t.ch : l.from < t.ch)) &&
                                (null == l.to || (s.inclusiveRight ? l.to >= t.ch : l.to > t.ch))
                            ) {
                                if (i && (rt(s, "beforeCursorEnter"), s.explicitlyCleared)) {
                                    if (o.markedSpans) {
                                        --a;
                                        continue;
                                    }
                                    break;
                                }
                                if (!s.atomic) continue;
                                if (r) {
                                    var c = s.find(n < 0 ? 1 : -1),
                                        u = void 0;
                                    if (
                                        ((n < 0 ? s.inclusiveRight : s.inclusiveLeft) &&
                                            (c = eo(e, c, -n, c && c.line == t.line ? o : null)),
                                            c && c.line == t.line && (u = ge(c, r)) && (n < 0 ? u < 0 : u > 0))
                                    )
                                        return Qi(e, c, t, n, i);
                                }
                                var d = s.find(n < 0 ? -1 : 1);
                                return (
                                    (n < 0 ? s.inclusiveLeft : s.inclusiveRight) &&
                                    (d = eo(e, d, n, d.line == t.line ? o : null)),
                                    d ? Qi(e, d, t, n, i) : null
                                );
                            }
                        }
                    return t;
                }

                function Ji(e, t, r, n, i) {
                    var o = n || 1,
                        a =
                        Qi(e, t, r, o, i) ||
                        (!i && Qi(e, t, r, o, !0)) ||
                        Qi(e, t, r, -o, i) ||
                        (!i && Qi(e, t, r, -o, !0));
                    return a || ((e.cantEdit = !0), me(e.first, 0));
                }

                function eo(e, t, r, n) {
                    return r < 0 && 0 == t.ch ?
                        t.line > e.first ?
                        ke(e, me(t.line - 1)) :
                        null :
                        r > 0 && t.ch == (n || le(e, t.line)).text.length ?
                        t.line < e.first + e.size - 1 ?
                        me(t.line + 1, 0) :
                        null :
                        new me(t.line, t.ch + r);
                }

                function to(e) {
                    e.setSelection(me(e.firstLine(), 0), me(e.lastLine()), $);
                }

                function ro(e, t, r) {
                    var n = {
                        canceled: !1,
                        from: t.from,
                        to: t.to,
                        text: t.text,
                        origin: t.origin,
                        cancel: function() {
                            return (n.canceled = !0);
                        },
                    };
                    return (
                        r &&
                        (n.update = function(t, r, i, o) {
                            t && (n.from = ke(e, t)),
                                r && (n.to = ke(e, r)),
                                i && (n.text = i),
                                void 0 !== o && (n.origin = o);
                        }),
                        rt(e, "beforeChange", e, n),
                        e.cm && rt(e.cm, "beforeChange", e.cm, n),
                        n.canceled ? null : { from: n.from, to: n.to, text: n.text, origin: n.origin }
                    );
                }

                function no(e, t, r) {
                    if (e.cm) {
                        if (!e.cm.curOp) return Kn(e.cm, no)(e, t, r);
                        if (e.cm.state.suppressEdits) return;
                    }
                    if (!(ot(e, "beforeChange") || (e.cm && ot(e.cm, "beforeChange"))) ||
                        (t = ro(e, t, !0))
                    ) {
                        var n =
                            Se &&
                            !r &&
                            (function(e, t, r) {
                                var n = null;
                                if (
                                    (e.iter(t.line, r.line + 1, function(e) {
                                        if (e.markedSpans)
                                            for (var t = 0; t < e.markedSpans.length; ++t) {
                                                var r = e.markedSpans[t].marker;
                                                !r.readOnly ||
                                                    (n && -1 != R(n, r)) ||
                                                    (n || (n = [])).push(r);
                                            }
                                    }), !n)
                                )
                                    return null;
                                for (var i = [{ from: t, to: r }], o = 0; o < n.length; ++o)
                                    for (var a = n[o], l = a.find(0), s = 0; s < i.length; ++s) {
                                        var c = i[s];
                                        if (!(ge(c.to, l.from) < 0 || ge(c.from, l.to) > 0)) {
                                            var u = [s, 1],
                                                d = ge(c.from, l.from),
                                                f = ge(c.to, l.to);
                                            (d < 0 || (!a.inclusiveLeft && !d)) &&
                                            u.push({ from: c.from, to: l.from }),
                                                (f > 0 || (!a.inclusiveRight && !f)) &&
                                                u.push({ from: l.to, to: c.to }),
                                                i.splice.apply(i, u),
                                                (s += u.length - 3);
                                        }
                                    }
                                return i;
                            })(e, t.from, t.to);
                        if (n)
                            for (var i = n.length - 1; i >= 0; --i)
                                io(e, {
                                    from: n[i].from,
                                    to: n[i].to,
                                    text: i ? [""] : t.text,
                                    origin: t.origin,
                                });
                        else io(e, t);
                    }
                }

                function io(e, t) {
                    if (1 != t.text.length || "" != t.text[0] || 0 != ge(t.from, t.to)) {
                        var r = ki(e, t);
                        Pi(e, t, r, e.cm ? e.cm.curOp.id : NaN), lo(e, t, r, Ae(e, t));
                        var n = [];
                        Oi(e, function(e, r) {
                            r || -1 != R(n, e.history) || (fo(e.history, t), n.push(e.history)),
                                lo(e, t, null, Ae(e, t));
                        });
                    }
                }

                function oo(e, t, r) {
                    if (!e.cm || !e.cm.state.suppressEdits || r) {
                        for (
                            var n,
                                i = e.history,
                                o = e.sel,
                                a = "undo" == t ? i.done : i.undone,
                                l = "undo" == t ? i.undone : i.done,
                                s = 0; s < a.length && ((n = a[s]), r ? !n.ranges || n.equals(e.sel) : n.ranges); s++
                        );
                        if (s != a.length) {
                            for (i.lastOrigin = i.lastSelOrigin = null;
                                (n = a.pop()).ranges;) {
                                if ((Di(n, l), r && !n.equals(e.sel)))
                                    return void Ki(e, n, { clearRedo: !1 });
                                o = n;
                            }
                            var c = [];
                            Di(o, l),
                                l.push({ changes: c, generation: i.generation }),
                                (i.generation = n.generation || ++i.maxGeneration);
                            for (
                                var u = ot(e, "beforeChange") || (e.cm && ot(e.cm, "beforeChange")),
                                    d = function(r) {
                                        var i = n.changes[r];
                                        if (((i.origin = t), u && !ro(e, i, !1))) return (a.length = 0), {};
                                        c.push(Ei(e, i));
                                        var o = r ? ki(e, i) : X(a);
                                        lo(e, i, o, Fi(e, i)), !r && e.cm && e.cm.scrollIntoView({ from: i.from, to: wi(i) });
                                        var l = [];
                                        Oi(e, function(e, t) {
                                            t ||
                                                -1 != R(l, e.history) ||
                                                (fo(e.history, i), l.push(e.history)),
                                                lo(e, i, null, Fi(e, i));
                                        });
                                    },
                                    f = n.changes.length - 1; f >= 0;
                                --f
                            ) {
                                var h = d(f);
                                if (h) return h.v;
                            }
                        }
                    }
                }

                function ao(e, t) {
                    if (
                        0 != t &&
                        ((e.first += t),
                            (e.sel = new gi(
                                Y(e.sel.ranges, function(e) {
                                    return new vi(
                                        me(e.anchor.line + t, e.anchor.ch),
                                        me(e.head.line + t, e.head.ch)
                                    );
                                }),
                                e.sel.primIndex
                            )),
                            e.cm)
                    ) {
                        Yn(e.cm, e.first, e.first - t, t);
                        for (var r = e.cm.display, n = r.viewFrom; n < r.viewTo; n++) Zn(e.cm, n, "gutter");
                    }
                }

                function lo(e, t, r, n) {
                    if (e.cm && !e.cm.curOp) return Kn(e.cm, lo)(e, t, r, n);
                    if (t.to.line < e.first) ao(e, t.text.length - 1 - (t.to.line - t.from.line));
                    else if (!(t.from.line > e.lastLine())) {
                        if (t.from.line < e.first) {
                            var i = t.text.length - 1 - (e.first - t.from.line);
                            ao(e, i),
                                (t = {
                                    from: me(e.first, 0),
                                    to: me(t.to.line + i, t.to.ch),
                                    text: [X(t.text)],
                                    origin: t.origin,
                                });
                        }
                        var o = e.lastLine();
                        t.to.line > o &&
                            (t = {
                                from: t.from,
                                to: me(o, le(e, o).text.length),
                                text: [t.text[0]],
                                origin: t.origin,
                            }),
                            (t.removed = se(e, t.from, t.to)),
                            r || (r = ki(e, t)),
                            e.cm ?
                            (function(e, t, r) {
                                var n = e.doc,
                                    i = e.display,
                                    o = t.from,
                                    a = t.to,
                                    l = !1,
                                    s = o.line;
                                e.options.lineWrapping ||
                                    ((s = de(Re(le(n, o.line)))),
                                        n.iter(s, a.line + 1, function(e) {
                                            if (e == i.maxLine) return (l = !0), !0;
                                        }));
                                n.sel.contains(t.from, t.to) > -1 && it(e);
                                Ti(n, t, r, nn(e)),
                                    e.options.lineWrapping ||
                                    (n.iter(s, o.line + t.text.length, function(e) {
                                            var t = Ve(e);
                                            t > i.maxLineLength &&
                                                ((i.maxLine = e),
                                                    (i.maxLineLength = t),
                                                    (i.maxLineChanged = !0),
                                                    (l = !1));
                                        }),
                                        l && (e.curOp.updateMaxLine = !0));
                                (function(e, t) {
                                    if (
                                        ((e.modeFrontier = Math.min(e.modeFrontier, t)), !(e.highlightFrontier < t - 10))
                                    ) {
                                        for (var r = e.first, n = t - 1; n > r; n--) {
                                            var i = le(e, n).stateAfter;
                                            if (i && (!(i instanceof Wt) || n + i.lookAhead < t)) {
                                                r = n + 1;
                                                break;
                                            }
                                        }
                                        e.highlightFrontier = Math.min(e.highlightFrontier, r);
                                    }
                                })(n, o.line),
                                ti(e, 400);
                                var c = t.text.length - (a.line - o.line) - 1;
                                t.full ?
                                    Yn(e) :
                                    o.line != a.line || 1 != t.text.length || Mi(e.doc, t) ?
                                    Yn(e, o.line, a.line + 1, c) :
                                    Zn(e, o.line, "text");
                                var u = ot(e, "changes"),
                                    d = ot(e, "change");
                                if (d || u) {
                                    var f = {
                                        from: o,
                                        to: a,
                                        text: t.text,
                                        removed: t.removed,
                                        origin: t.origin,
                                    };
                                    d && ar(e, "change", e, f),
                                        u && (e.curOp.changeObjs || (e.curOp.changeObjs = [])).push(f);
                                }
                                e.display.selForContextMenu = null;
                            })(e.cm, t, n) :
                            Ti(e, t, n),
                            Gi(e, r, $);
                    }
                }

                function so(e, t, r, n, i) {
                    var o;
                    (n || (n = r), ge(n, r) < 0) && ((r = (o = [n, r])[0]), (n = o[1]));
                    "string" == typeof t && (t = e.splitLines(t)),
                        no(e, { from: r, to: n, text: t, origin: i });
                }

                function co(e, t, r, n) {
                    r < e.line ? (e.line += n) : t < e.line && ((e.line = t), (e.ch = 0));
                }

                function uo(e, t, r, n) {
                    for (var i = 0; i < e.length; ++i) {
                        var o = e[i],
                            a = !0;
                        if (o.ranges) {
                            o.copied || ((o = e[i] = o.deepCopy()).copied = !0);
                            for (var l = 0; l < o.ranges.length; l++)
                                co(o.ranges[l].anchor, t, r, n), co(o.ranges[l].head, t, r, n);
                        } else {
                            for (var s = 0; s < o.changes.length; ++s) {
                                var c = o.changes[s];
                                if (r < c.from.line)
                                    (c.from = me(c.from.line + n, c.from.ch)),
                                    (c.to = me(c.to.line + n, c.to.ch));
                                else if (t <= c.to.line) {
                                    a = !1;
                                    break;
                                }
                            }
                            a || (e.splice(0, i + 1), (i = 0));
                        }
                    }
                }

                function fo(e, t) {
                    var r = t.from.line,
                        n = t.to.line,
                        i = t.text.length - (n - r) - 1;
                    uo(e.done, r, n, i), uo(e.undone, r, n, i);
                }

                function ho(e, t, r, n) {
                    var i = t,
                        o = t;
                    return (
                        "number" == typeof t ? (o = le(e, xe(e, t))) : (i = de(t)),
                        null == i ? null : (n(o, i) && e.cm && Zn(e.cm, i, r), o)
                    );
                }

                function po(e) {
                    (this.lines = e), (this.parent = null);
                    for (var t = 0, r = 0; r < e.length; ++r)(e[r].parent = this), (t += e[r].height);
                    this.height = t;
                }

                function mo(e) {
                    this.children = e;
                    for (var t = 0, r = 0, n = 0; n < e.length; ++n) {
                        var i = e[n];
                        (t += i.chunkSize()), (r += i.height), (i.parent = this);
                    }
                    (this.size = t), (this.height = r), (this.parent = null);
                }
                (vi.prototype.from = function() {
                    return we(this.anchor, this.head);
                }),
                (vi.prototype.to = function() {
                    return be(this.anchor, this.head);
                }),
                (vi.prototype.empty = function() {
                    return this.head.line == this.anchor.line && this.head.ch == this.anchor.ch;
                }),
                (po.prototype = {
                    chunkSize: function() {
                        return this.lines.length;
                    },
                    removeInner: function(e, t) {
                        for (var r = e, n = e + t; r < n; ++r) {
                            var i = this.lines[r];
                            (this.height -= i.height), Vt(i), ar(i, "delete");
                        }
                        this.lines.splice(e, t);
                    },
                    collapse: function(e) {
                        e.push.apply(e, this.lines);
                    },
                    insertInner: function(e, t, r) {
                        (this.height += r),
                        (this.lines = this.lines.slice(0, e).concat(t).concat(this.lines.slice(e)));
                        for (var n = 0; n < t.length; ++n) t[n].parent = this;
                    },
                    iterN: function(e, t, r) {
                        for (var n = e + t; e < n; ++e)
                            if (r(this.lines[e])) return !0;
                    },
                }),
                (mo.prototype = {
                    chunkSize: function() {
                        return this.size;
                    },
                    removeInner: function(e, t) {
                        this.size -= t;
                        for (var r = 0; r < this.children.length; ++r) {
                            var n = this.children[r],
                                i = n.chunkSize();
                            if (e < i) {
                                var o = Math.min(t, i - e),
                                    a = n.height;
                                if (
                                    (n.removeInner(e, o),
                                        (this.height -= a - n.height),
                                        i == o && (this.children.splice(r--, 1), (n.parent = null)),
                                        0 == (t -= o))
                                )
                                    break;
                                e = 0;
                            } else e -= i;
                        }
                        if (
                            this.size - t < 25 &&
                            (this.children.length > 1 || !(this.children[0] instanceof po))
                        ) {
                            var l = [];
                            this.collapse(l),
                                (this.children = [new po(l)]),
                                (this.children[0].parent = this);
                        }
                    },
                    collapse: function(e) {
                        for (var t = 0; t < this.children.length; ++t) this.children[t].collapse(e);
                    },
                    insertInner: function(e, t, r) {
                        (this.size += t.length), (this.height += r);
                        for (var n = 0; n < this.children.length; ++n) {
                            var i = this.children[n],
                                o = i.chunkSize();
                            if (e <= o) {
                                if ((i.insertInner(e, t, r), i.lines && i.lines.length > 50)) {
                                    for (
                                        var a = (i.lines.length % 25) + 25, l = a; l < i.lines.length;

                                    ) {
                                        var s = new po(i.lines.slice(l, (l += 25)));
                                        (i.height -= s.height),
                                        this.children.splice(++n, 0, s),
                                            (s.parent = this);
                                    }
                                    (i.lines = i.lines.slice(0, a)), this.maybeSpill();
                                }
                                break;
                            }
                            e -= o;
                        }
                    },
                    maybeSpill: function() {
                        if (!(this.children.length <= 10)) {
                            var e = this;
                            do {
                                var t = new mo(e.children.splice(e.children.length - 5, 5));
                                if (e.parent) {
                                    (e.size -= t.size), (e.height -= t.height);
                                    var r = R(e.parent.children, e);
                                    e.parent.children.splice(r + 1, 0, t);
                                } else {
                                    var n = new mo(e.children);
                                    (n.parent = e), (e.children = [n, t]), (e = n);
                                }
                                t.parent = e.parent;
                            } while (e.children.length > 10);
                            e.parent.maybeSpill();
                        }
                    },
                    iterN: function(e, t, r) {
                        for (var n = 0; n < this.children.length; ++n) {
                            var i = this.children[n],
                                o = i.chunkSize();
                            if (e < o) {
                                var a = Math.min(t, o - e);
                                if (i.iterN(e, a, r)) return !0;
                                if (0 == (t -= a)) break;
                                e = 0;
                            } else e -= o;
                        }
                    },
                });
                var go = function(e, t, r) {
                    if (r)
                        for (var n in r) r.hasOwnProperty(n) && (this[n] = r[n]);
                    (this.doc = e), (this.node = t);
                };

                function vo(e, t, r) {
                    Ue(t) < ((e.curOp && e.curOp.scrollTop) || e.doc.scrollTop) && Sn(e, r);
                }
                (go.prototype.clear = function() {
                    var e = this.doc.cm,
                        t = this.line.widgets,
                        r = this.line,
                        n = de(r);
                    if (null != n && t) {
                        for (var i = 0; i < t.length; ++i) t[i] == this && t.splice(i--, 1);
                        t.length || (r.widgets = null);
                        var o = br(this);
                        ue(r, Math.max(0, r.height - o)),
                            e &&
                            (Vn(e, function() {
                                    vo(e, r, -o), Zn(e, n, "widget");
                                }),
                                ar(e, "lineWidgetCleared", e, this, n));
                    }
                }),
                (go.prototype.changed = function() {
                    var e = this,
                        t = this.height,
                        r = this.doc.cm,
                        n = this.line;
                    this.height = null;
                    var i = br(this) - t;
                    i &&
                        (ue(n, n.height + i),
                            r &&
                            Vn(r, function() {
                                (r.curOp.forceUpdate = !0),
                                vo(r, n, i),
                                    ar(r, "lineWidgetChanged", r, e, de(n));
                            }));
                }),
                at(go);
                var yo = 0,
                    bo = function(e, t) {
                        (this.lines = []), (this.type = t), (this.doc = e), (this.id = ++yo);
                    };

                function wo(e, t, r, n, i) {
                    if (n && n.shared)
                        return (function(e, t, r, n, i) {
                            (n = I(n)).shared = !1;
                            var o = [wo(e, t, r, n, i)],
                                a = o[0],
                                l = n.widgetNode;
                            return (
                                Oi(e, function(e) {
                                    l && (n.widgetNode = l.cloneNode(!0)),
                                        o.push(wo(e, ke(e, t), ke(e, r), n, i));
                                    for (var s = 0; s < e.linked.length; ++s)
                                        if (e.linked[s].isParent) return;
                                    a = X(o);
                                }),
                                new xo(o, a)
                            );
                        })(e, t, r, n, i);
                    if (e.cm && !e.cm.curOp) return Kn(e.cm, wo)(e, t, r, n, i);
                    var o = new bo(e, i),
                        a = ge(t, r);
                    if ((n && I(n, o, !1), a > 0 || (0 == a && !1 !== o.clearWhenEmpty))) return o;
                    if (
                        (o.replacedWith &&
                            ((o.collapsed = !0),
                                (o.widgetNode = z("span", [o.replacedWith], "CodeMirror-widget")),
                                n.handleMouseEvents || o.widgetNode.setAttribute("cm-ignore-events", "true"),
                                n.insertLeft && (o.widgetNode.insertLeft = !0)),
                            o.collapsed)
                    ) {
                        if (Fe(e, t.line, t, r, o) || (t.line != r.line && Fe(e, r.line, t, r, o)))
                            throw new Error(
                                "Inserting collapsed marker partially overlapping an existing one"
                            );
                        Le = !0;
                    }
                    o.addToHistory && Pi(e, { from: t, to: r, origin: "markText" }, e.sel, NaN);
                    var l,
                        s = t.line,
                        c = e.cm;
                    if (
                        (e.iter(s, r.line + 1, function(e) {
                                c &&
                                    o.collapsed &&
                                    !c.options.lineWrapping &&
                                    Re(e) == c.display.maxLine &&
                                    (l = !0),
                                    o.collapsed && s != t.line && ue(e, 0),
                                    (function(e, t) {
                                        (e.markedSpans = e.markedSpans ? e.markedSpans.concat([t]) : [t]),
                                        t.marker.attachLine(e);
                                    })(e, new Me(o, s == t.line ? t.ch : null, s == r.line ? r.ch : null)),
                                    ++s;
                            }),
                            o.collapsed &&
                            e.iter(t.line, r.line + 1, function(t) {
                                $e(e, t) && ue(t, 0);
                            }),
                            o.clearOnEnter &&
                            Je(o, "beforeCursorEnter", function() {
                                return o.clear();
                            }),
                            o.readOnly &&
                            ((Se = !0),
                                (e.history.done.length || e.history.undone.length) && e.clearHistory()),
                            o.collapsed && ((o.id = ++yo), (o.atomic = !0)),
                            c)
                    ) {
                        if ((l && (c.curOp.updateMaxLine = !0), o.collapsed)) Yn(c, t.line, r.line + 1);
                        else if (o.className || o.title || o.startStyle || o.endStyle || o.css)
                            for (var u = t.line; u <= r.line; u++) Zn(c, u, "text");
                        o.atomic && Yi(c.doc), ar(c, "markerAdded", c, o);
                    }
                    return o;
                }
                (bo.prototype.clear = function() {
                    if (!this.explicitlyCleared) {
                        var e = this.doc.cm,
                            t = e && !e.curOp;
                        if ((t && Rn(e), ot(this, "clear"))) {
                            var r = this.find();
                            r && ar(this, "clear", r.from, r.to);
                        }
                        for (var n = null, i = null, o = 0; o < this.lines.length; ++o) {
                            var a = this.lines[o],
                                l = Te(a.markedSpans, this);
                            e && !this.collapsed ?
                                Zn(e, de(a), "text") :
                                e && (null != l.to && (i = de(a)), null != l.from && (n = de(a))),
                                (a.markedSpans = Oe(a.markedSpans, l)),
                                null == l.from &&
                                this.collapsed &&
                                !$e(this.doc, a) &&
                                e &&
                                ue(a, Jr(e.display));
                        }
                        if (e && this.collapsed && !e.options.lineWrapping)
                            for (var s = 0; s < this.lines.length; ++s) {
                                var c = Re(this.lines[s]),
                                    u = Ve(c);
                                u > e.display.maxLineLength &&
                                    ((e.display.maxLine = c),
                                        (e.display.maxLineLength = u),
                                        (e.display.maxLineChanged = !0));
                            }
                        null != n && e && this.collapsed && Yn(e, n, i + 1),
                            (this.lines.length = 0),
                            (this.explicitlyCleared = !0),
                            this.atomic && this.doc.cantEdit && ((this.doc.cantEdit = !1), e && Yi(e.doc)),
                            e && ar(e, "markerCleared", e, this, n, i),
                            t && _n(e),
                            this.parent && this.parent.clear();
                    }
                }),
                (bo.prototype.find = function(e, t) {
                    var r, n;
                    null == e && "bookmark" == this.type && (e = 1);
                    for (var i = 0; i < this.lines.length; ++i) {
                        var o = this.lines[i],
                            a = Te(o.markedSpans, this);
                        if (null != a.from && ((r = me(t ? o : de(o), a.from)), -1 == e)) return r;
                        if (null != a.to && ((n = me(t ? o : de(o), a.to)), 1 == e)) return n;
                    }
                    return r && { from: r, to: n };
                }),
                (bo.prototype.changed = function() {
                    var e = this,
                        t = this.find(-1, !0),
                        r = this,
                        n = this.doc.cm;
                    t &&
                        n &&
                        Vn(n, function() {
                            var i = t.line,
                                o = de(t.line),
                                a = Ar(n, o);
                            if (
                                (a && (Dr(a), (n.curOp.selectionChanged = n.curOp.forceUpdate = !0)),
                                    (n.curOp.updateMaxLine = !0), !$e(r.doc, i) && null != r.height)
                            ) {
                                var l = r.height;
                                r.height = null;
                                var s = br(r) - l;
                                s && ue(i, i.height + s);
                            }
                            ar(n, "markerChanged", n, e);
                        });
                }),
                (bo.prototype.attachLine = function(e) {
                    if (!this.lines.length && this.doc.cm) {
                        var t = this.doc.cm.curOp;
                        (t.maybeHiddenMarkers && -1 != R(t.maybeHiddenMarkers, this)) ||
                        (t.maybeUnhiddenMarkers || (t.maybeUnhiddenMarkers = [])).push(this);
                    }
                    this.lines.push(e);
                }),
                (bo.prototype.detachLine = function(e) {
                    if ((this.lines.splice(R(this.lines, e), 1), !this.lines.length && this.doc.cm)) {
                        var t = this.doc.cm.curOp;
                        (t.maybeHiddenMarkers || (t.maybeHiddenMarkers = [])).push(this);
                    }
                }),
                at(bo);
                var xo = function(e, t) {
                    (this.markers = e), (this.primary = t);
                    for (var r = 0; r < e.length; ++r) e[r].parent = this;
                };

                function ko(e) {
                    return e.findMarks(me(e.first, 0), e.clipPos(me(e.lastLine())), function(e) {
                        return e.parent;
                    });
                }

                function Co(e) {
                    for (
                        var t = function(t) {
                                var r = e[t],
                                    n = [r.primary.doc];
                                Oi(r.primary.doc, function(e) {
                                    return n.push(e);
                                });
                                for (var i = 0; i < r.markers.length; i++) {
                                    var o = r.markers[i]; -
                                    1 == R(n, o.doc) && ((o.parent = null), r.markers.splice(i--, 1));
                                }
                            },
                            r = 0; r < e.length; r++
                    )
                        t(r);
                }
                (xo.prototype.clear = function() {
                    if (!this.explicitlyCleared) {
                        this.explicitlyCleared = !0;
                        for (var e = 0; e < this.markers.length; ++e) this.markers[e].clear();
                        ar(this, "clear");
                    }
                }),
                (xo.prototype.find = function(e, t) {
                    return this.primary.find(e, t);
                }),
                at(xo);
                var So = 0,
                    Lo = function(e, t, r, n, i) {
                        if (!(this instanceof Lo)) return new Lo(e, t, r, n, i);
                        null == r && (r = 0),
                            mo.call(this, [new po([new Ut("", null)])]),
                            (this.first = r),
                            (this.scrollTop = this.scrollLeft = 0),
                            (this.cantEdit = !1),
                            (this.cleanGeneration = 1),
                            (this.modeFrontier = this.highlightFrontier = r);
                        var o = me(r, 0);
                        (this.sel = bi(o)),
                        (this.history = new Ni(null)),
                        (this.id = ++So),
                        (this.modeOption = t),
                        (this.lineSep = n),
                        (this.direction = "rtl" == i ? "rtl" : "ltr"),
                        (this.extend = !1),
                        "string" == typeof e && (e = this.splitLines(e)),
                            Ti(this, { from: o, to: o, text: e }),
                            Ki(this, bi(o), $);
                    };
                (Lo.prototype = Q(mo.prototype, {
                    constructor: Lo,
                    iter: function(e, t, r) {
                        r
                            ?
                            this.iterN(e - this.first, t - e, r) :
                            this.iterN(this.first, this.first + this.size, e);
                    },
                    insert: function(e, t) {
                        for (var r = 0, n = 0; n < t.length; ++n) r += t[n].height;
                        this.insertInner(e - this.first, t, r);
                    },
                    remove: function(e, t) {
                        this.removeInner(e - this.first, t);
                    },
                    getValue: function(e) {
                        var t = ce(this, this.first, this.first + this.size);
                        return !1 === e ? t : t.join(e || this.lineSeparator());
                    },
                    setValue: Xn(function(e) {
                        var t = me(this.first, 0),
                            r = this.first + this.size - 1;
                        no(
                                this, {
                                    from: t,
                                    to: me(r, le(this, r).text.length),
                                    text: this.splitLines(e),
                                    origin: "setValue",
                                    full: !0,
                                }, !0
                            ),
                            this.cm && Mn(this.cm, 0, 0),
                            Ki(this, bi(t), $);
                    }),
                    replaceRange: function(e, t, r, n) {
                        so(this, e, (t = ke(this, t)), (r = r ? ke(this, r) : t), n);
                    },
                    getRange: function(e, t, r) {
                        var n = se(this, ke(this, e), ke(this, t));
                        return !1 === r ? n : n.join(r || this.lineSeparator());
                    },
                    getLine: function(e) {
                        var t = this.getLineHandle(e);
                        return t && t.text;
                    },
                    getLineHandle: function(e) {
                        if (he(this, e)) return le(this, e);
                    },
                    getLineNumber: function(e) {
                        return de(e);
                    },
                    getLineHandleVisualStart: function(e) {
                        return "number" == typeof e && (e = le(this, e)), Re(e);
                    },
                    lineCount: function() {
                        return this.size;
                    },
                    firstLine: function() {
                        return this.first;
                    },
                    lastLine: function() {
                        return this.first + this.size - 1;
                    },
                    clipPos: function(e) {
                        return ke(this, e);
                    },
                    getCursor: function(e) {
                        var t = this.sel.primary();
                        return null == e || "head" == e ?
                            t.head :
                            "anchor" == e ?
                            t.anchor :
                            "end" == e || "to" == e || !1 === e ?
                            t.to() :
                            t.from();
                    },
                    listSelections: function() {
                        return this.sel.ranges;
                    },
                    somethingSelected: function() {
                        return this.sel.somethingSelected();
                    },
                    setCursor: Xn(function(e, t, r) {
                        Ui(this, ke(this, "number" == typeof e ? me(e, t || 0) : e), null, r);
                    }),
                    setSelection: Xn(function(e, t, r) {
                        Ui(this, ke(this, e), ke(this, t || e), r);
                    }),
                    extendSelection: Xn(function(e, t, r) {
                        Bi(this, ke(this, e), t && ke(this, t), r);
                    }),
                    extendSelections: Xn(function(e, t) {
                        $i(this, Ce(this, e), t);
                    }),
                    extendSelectionsBy: Xn(function(e, t) {
                        $i(this, Ce(this, Y(this.sel.ranges, e)), t);
                    }),
                    setSelections: Xn(function(e, t, r) {
                        if (e.length) {
                            for (var n = [], i = 0; i < e.length; i++)
                                n[i] = new vi(ke(this, e[i].anchor), ke(this, e[i].head));
                            null == t && (t = Math.min(e.length - 1, this.sel.primIndex)),
                                Ki(this, yi(n, t), r);
                        }
                    }),
                    addSelection: Xn(function(e, t, r) {
                        var n = this.sel.ranges.slice(0);
                        n.push(new vi(ke(this, e), ke(this, t || e))), Ki(this, yi(n, n.length - 1), r);
                    }),
                    getSelection: function(e) {
                        for (var t, r = this.sel.ranges, n = 0; n < r.length; n++) {
                            var i = se(this, r[n].from(), r[n].to());
                            t = t ? t.concat(i) : i;
                        }
                        return !1 === e ? t : t.join(e || this.lineSeparator());
                    },
                    getSelections: function(e) {
                        for (var t = [], r = this.sel.ranges, n = 0; n < r.length; n++) {
                            var i = se(this, r[n].from(), r[n].to());
                            !1 !== e && (i = i.join(e || this.lineSeparator())), (t[n] = i);
                        }
                        return t;
                    },
                    replaceSelection: function(e, t, r) {
                        for (var n = [], i = 0; i < this.sel.ranges.length; i++) n[i] = e;
                        this.replaceSelections(n, t, r || "+input");
                    },
                    replaceSelections: Xn(function(e, t, r) {
                        for (var n = [], i = this.sel, o = 0; o < i.ranges.length; o++) {
                            var a = i.ranges[o];
                            n[o] = { from: a.from(), to: a.to(), text: this.splitLines(e[o]), origin: r };
                        }
                        for (
                            var l =
                                t &&
                                "end" != t &&
                                (function(e, t, r) {
                                    for (
                                        var n = [], i = me(e.first, 0), o = i, a = 0; a < t.length; a++
                                    ) {
                                        var l = t[a],
                                            s = Ci(l.from, i, o),
                                            c = Ci(wi(l), i, o);
                                        if (((i = l.to), (o = c), "around" == r)) {
                                            var u = e.sel.ranges[a],
                                                d = ge(u.head, u.anchor) < 0;
                                            n[a] = new vi(d ? c : s, d ? s : c);
                                        } else n[a] = new vi(s, s);
                                    }
                                    return new gi(n, e.sel.primIndex);
                                })(this, n, t),
                                s = n.length - 1; s >= 0; s--
                        )
                            no(this, n[s]);
                        l ? Vi(this, l) : this.cm && Ln(this.cm);
                    }),
                    undo: Xn(function() {
                        oo(this, "undo");
                    }),
                    redo: Xn(function() {
                        oo(this, "redo");
                    }),
                    undoSelection: Xn(function() {
                        oo(this, "undo", !0);
                    }),
                    redoSelection: Xn(function() {
                        oo(this, "redo", !0);
                    }),
                    setExtending: function(e) {
                        this.extend = e;
                    },
                    getExtending: function() {
                        return this.extend;
                    },
                    historySize: function() {
                        for (var e = this.history, t = 0, r = 0, n = 0; n < e.done.length; n++)
                            e.done[n].ranges || ++t;
                        for (var i = 0; i < e.undone.length; i++) e.undone[i].ranges || ++r;
                        return { undo: t, redo: r };
                    },
                    clearHistory: function() {
                        this.history = new Ni(this.history.maxGeneration);
                    },
                    markClean: function() {
                        this.cleanGeneration = this.changeGeneration(!0);
                    },
                    changeGeneration: function(e) {
                        return (
                            e &&
                            (this.history.lastOp = this.history.lastSelOp = this.history.lastOrigin = null),
                            this.history.generation
                        );
                    },
                    isClean: function(e) {
                        return this.history.generation == (e || this.cleanGeneration);
                    },
                    getHistory: function() {
                        return { done: Ri(this.history.done), undone: Ri(this.history.undone) };
                    },
                    setHistory: function(e) {
                        var t = (this.history = new Ni(this.history.maxGeneration));
                        (t.done = Ri(e.done.slice(0), null, !0)),
                        (t.undone = Ri(e.undone.slice(0), null, !0));
                    },
                    setGutterMarker: Xn(function(e, t, r) {
                        return ho(this, e, "gutter", function(e) {
                            var n = e.gutterMarkers || (e.gutterMarkers = {});
                            return (n[t] = r), !r && re(n) && (e.gutterMarkers = null), !0;
                        });
                    }),
                    clearGutter: Xn(function(e) {
                        var t = this;
                        this.iter(function(r) {
                            r.gutterMarkers &&
                                r.gutterMarkers[e] &&
                                ho(t, r, "gutter", function() {
                                    return (
                                        (r.gutterMarkers[e] = null),
                                        re(r.gutterMarkers) && (r.gutterMarkers = null), !0
                                    );
                                });
                        });
                    }),
                    lineInfo: function(e) {
                        var t;
                        if ("number" == typeof e) {
                            if (!he(this, e)) return null;
                            if (((t = e), !(e = le(this, e)))) return null;
                        } else if (null == (t = de(e))) return null;
                        return {
                            line: t,
                            handle: e,
                            text: e.text,
                            gutterMarkers: e.gutterMarkers,
                            textClass: e.textClass,
                            bgClass: e.bgClass,
                            wrapClass: e.wrapClass,
                            widgets: e.widgets,
                        };
                    },
                    addLineClass: Xn(function(e, t, r) {
                        return ho(this, e, "gutter" == t ? "gutter" : "class", function(e) {
                            var n =
                                "text" == t ?
                                "textClass" :
                                "background" == t ?
                                "bgClass" :
                                "gutter" == t ?
                                "gutterClass" :
                                "wrapClass";
                            if (e[n]) {
                                if (S(r).test(e[n])) return !1;
                                e[n] += " " + r;
                            } else e[n] = r;
                            return !0;
                        });
                    }),
                    removeLineClass: Xn(function(e, t, r) {
                        return ho(this, e, "gutter" == t ? "gutter" : "class", function(e) {
                            var n =
                                "text" == t ?
                                "textClass" :
                                "background" == t ?
                                "bgClass" :
                                "gutter" == t ?
                                "gutterClass" :
                                "wrapClass",
                                i = e[n];
                            if (!i) return !1;
                            if (null == r) e[n] = null;
                            else {
                                var o = i.match(S(r));
                                if (!o) return !1;
                                var a = o.index + o[0].length;
                                e[n] =
                                    i.slice(0, o.index) +
                                    (o.index && a != i.length ? " " : "") +
                                    i.slice(a) || null;
                            }
                            return !0;
                        });
                    }),
                    addLineWidget: Xn(function(e, t, r) {
                        return (function(e, t, r, n) {
                            var i = new go(e, r, n),
                                o = e.cm;
                            return (
                                o && i.noHScroll && (o.display.alignWidgets = !0),
                                ho(e, t, "widget", function(t) {
                                    var r = t.widgets || (t.widgets = []);
                                    if (
                                        (null == i.insertAt ?
                                            r.push(i) :
                                            r.splice(Math.min(r.length - 1, Math.max(0, i.insertAt)), 0, i),
                                            (i.line = t),
                                            o && !$e(e, t))
                                    ) {
                                        var n = Ue(t) < e.scrollTop;
                                        ue(t, t.height + br(i)),
                                            n && Sn(o, i.height),
                                            (o.curOp.forceUpdate = !0);
                                    }
                                    return !0;
                                }),
                                ar(o, "lineWidgetAdded", o, i, "number" == typeof t ? t : de(t)),
                                i
                            );
                        })(this, e, t, r);
                    }),
                    removeLineWidget: function(e) {
                        e.clear();
                    },
                    markText: function(e, t, r) {
                        return wo(this, ke(this, e), ke(this, t), r, (r && r.type) || "range");
                    },
                    setBookmark: function(e, t) {
                        var r = {
                            replacedWith: t && (null == t.nodeType ? t.widget : t),
                            insertLeft: t && t.insertLeft,
                            clearWhenEmpty: !1,
                            shared: t && t.shared,
                            handleMouseEvents: t && t.handleMouseEvents,
                        };
                        return wo(this, (e = ke(this, e)), e, r, "bookmark");
                    },
                    findMarksAt: function(e) {
                        var t = [],
                            r = le(this, (e = ke(this, e)).line).markedSpans;
                        if (r)
                            for (var n = 0; n < r.length; ++n) {
                                var i = r[n];
                                (null == i.from || i.from <= e.ch) &&
                                (null == i.to || i.to >= e.ch) &&
                                t.push(i.marker.parent || i.marker);
                            }
                        return t;
                    },
                    findMarks: function(e, t, r) {
                        (e = ke(this, e)), (t = ke(this, t));
                        var n = [],
                            i = e.line;
                        return (
                            this.iter(e.line, t.line + 1, function(o) {
                                var a = o.markedSpans;
                                if (a)
                                    for (var l = 0; l < a.length; l++) {
                                        var s = a[l];
                                        (null != s.to && i == e.line && e.ch >= s.to) ||
                                        (null == s.from && i != e.line) ||
                                        (null != s.from && i == t.line && s.from >= t.ch) ||
                                        (r && !r(s.marker)) ||
                                        n.push(s.marker.parent || s.marker);
                                    }
                                    ++i;
                            }),
                            n
                        );
                    },
                    getAllMarks: function() {
                        var e = [];
                        return (
                            this.iter(function(t) {
                                var r = t.markedSpans;
                                if (r)
                                    for (var n = 0; n < r.length; ++n)
                                        null != r[n].from && e.push(r[n].marker);
                            }),
                            e
                        );
                    },
                    posFromIndex: function(e) {
                        var t,
                            r = this.first,
                            n = this.lineSeparator().length;
                        return (
                            this.iter(function(i) {
                                var o = i.text.length + n;
                                if (o > e) return (t = e), !0;
                                (e -= o), ++r;
                            }),
                            ke(this, me(r, t))
                        );
                    },
                    indexFromPos: function(e) {
                        var t = (e = ke(this, e)).ch;
                        if (e.line < this.first || e.ch < 0) return 0;
                        var r = this.lineSeparator().length;
                        return (
                            this.iter(this.first, e.line, function(e) {
                                t += e.text.length + r;
                            }),
                            t
                        );
                    },
                    copy: function(e) {
                        var t = new Lo(
                            ce(this, this.first, this.first + this.size),
                            this.modeOption,
                            this.first,
                            this.lineSep,
                            this.direction
                        );
                        return (
                            (t.scrollTop = this.scrollTop),
                            (t.scrollLeft = this.scrollLeft),
                            (t.sel = this.sel),
                            (t.extend = !1),
                            e &&
                            ((t.history.undoDepth = this.history.undoDepth),
                                t.setHistory(this.getHistory())),
                            t
                        );
                    },
                    linkedDoc: function(e) {
                        e || (e = {});
                        var t = this.first,
                            r = this.first + this.size;
                        null != e.from && e.from > t && (t = e.from), null != e.to && e.to < r && (r = e.to);
                        var n = new Lo(
                            ce(this, t, r),
                            e.mode || this.modeOption,
                            t,
                            this.lineSep,
                            this.direction
                        );
                        return (
                            e.sharedHist && (n.history = this.history),
                            (this.linked || (this.linked = [])).push({ doc: n, sharedHist: e.sharedHist }),
                            (n.linked = [{ doc: this, isParent: !0, sharedHist: e.sharedHist }]),
                            (function(e, t) {
                                for (var r = 0; r < t.length; r++) {
                                    var n = t[r],
                                        i = n.find(),
                                        o = e.clipPos(i.from),
                                        a = e.clipPos(i.to);
                                    if (ge(o, a)) {
                                        var l = wo(e, o, a, n.primary, n.primary.type);
                                        n.markers.push(l), (l.parent = n);
                                    }
                                }
                            })(n, ko(this)),
                            n
                        );
                    },
                    unlinkDoc: function(e) {
                        if ((e instanceof ka && (e = e.doc), this.linked))
                            for (var t = 0; t < this.linked.length; ++t) {
                                if (this.linked[t].doc == e) {
                                    this.linked.splice(t, 1), e.unlinkDoc(this), Co(ko(this));
                                    break;
                                }
                            }
                        if (e.history == this.history) {
                            var r = [e.id];
                            Oi(
                                    e,
                                    function(e) {
                                        return r.push(e.id);
                                    }, !0
                                ),
                                (e.history = new Ni(null)),
                                (e.history.done = Ri(this.history.done, r)),
                                (e.history.undone = Ri(this.history.undone, r));
                        }
                    },
                    iterLinkedDocs: function(e) {
                        Oi(this, e);
                    },
                    getMode: function() {
                        return this.mode;
                    },
                    getEditor: function() {
                        return this.cm;
                    },
                    splitLines: function(e) {
                        return this.lineSep ? e.split(this.lineSep) : bt(e);
                    },
                    lineSeparator: function() {
                        return this.lineSep || "\n";
                    },
                    setDirection: Xn(function(e) {
                        var t;
                        ("rtl" != e && (e = "ltr"), e != this.direction) &&
                        ((this.direction = e),
                            this.iter(function(e) {
                                return (e.order = null);
                            }),
                            this.cm &&
                            Vn((t = this.cm), function() {
                                zi(t), Yn(t);
                            }));
                    }),
                })),
                (Lo.prototype.eachLine = Lo.prototype.iter);
                var Mo = 0;

                function To(e) {
                    var t = this;
                    if ((Oo(t), !nt(t, e) && !wr(t.display, e))) {
                        lt(e), a && (Mo = +new Date());
                        var r = an(t, e, !0),
                            n = e.dataTransfer.files;
                        if (r && !t.isReadOnly())
                            if (n && n.length && window.FileReader && window.File)
                                for (
                                    var i = n.length,
                                        o = Array(i),
                                        l = 0,
                                        s = function(e, n) {
                                            if (!t.options.allowDropFileTypes ||
                                                -1 != R(t.options.allowDropFileTypes, e.type)
                                            ) {
                                                var a = new FileReader();
                                                (a.onload = Kn(t, function() {
                                                    var e = a.result;
                                                    if (
                                                        (/[\x00-\x08\x0e-\x1f]{2}/.test(e) && (e = ""),
                                                            (o[n] = e),
                                                            ++l == i)
                                                    ) {
                                                        var s = {
                                                            from: (r = ke(t.doc, r)),
                                                            to: r,
                                                            text: t.doc.splitLines(
                                                                o.join(t.doc.lineSeparator())
                                                            ),
                                                            origin: "paste",
                                                        };
                                                        no(t.doc, s), Vi(t.doc, bi(r, wi(s)));
                                                    }
                                                })),
                                                a.readAsText(e);
                                            }
                                        },
                                        c = 0; c < i;
                                    ++c
                                )
                                    s(n[c], c);
                            else {
                                if (t.state.draggingText && t.doc.sel.contains(r) > -1)
                                    return (
                                        t.state.draggingText(e),
                                        void setTimeout(function() {
                                            return t.display.input.focus();
                                        }, 20)
                                    );
                                try {
                                    var u = e.dataTransfer.getData("Text");
                                    if (u) {
                                        var d;
                                        if (
                                            (t.state.draggingText &&
                                                !t.state.draggingText.copy &&
                                                (d = t.listSelections()),
                                                Gi(t.doc, bi(r, r)),
                                                d)
                                        )
                                            for (var f = 0; f < d.length; ++f)
                                                so(t.doc, "", d[f].anchor, d[f].head, "drag");
                                        t.replaceSelection(u, "around", "paste"), t.display.input.focus();
                                    }
                                } catch (e) {}
                            }
                    }
                }

                function Oo(e) {
                    e.display.dragCursor &&
                        (e.display.lineSpace.removeChild(e.display.dragCursor),
                            (e.display.dragCursor = null));
                }

                function Ao(e) {
                    if (document.getElementsByClassName)
                        for (
                            var t = document.getElementsByClassName("CodeMirror"), r = 0; r < t.length; r++
                        ) {
                            var n = t[r].CodeMirror;
                            n && e(n);
                        }
                }
                var zo = !1;

                function No() {
                    var e;
                    zo ||
                        (Je(window, "resize", function() {
                                null == e &&
                                    (e = setTimeout(function() {
                                        (e = null), Ao(Eo);
                                    }, 100));
                            }),
                            Je(window, "blur", function() {
                                return Ao(vn);
                            }),
                            (zo = !0));
                }

                function Eo(e) {
                    var t = e.display;
                    (t.lastWrapHeight == t.wrapper.clientHeight &&
                        t.lastWrapWidth == t.wrapper.clientWidth) ||
                    ((t.cachedCharWidth = t.cachedTextHeight = t.cachedPaddingH = null),
                        (t.scrollbarsClipped = !1),
                        e.setSize());
                }
                for (
                    var Wo = {
                            3: "Pause",
                            8: "Backspace",
                            9: "Tab",
                            13: "Enter",
                            16: "Shift",
                            17: "Ctrl",
                            18: "Alt",
                            19: "Pause",
                            20: "CapsLock",
                            27: "Esc",
                            32: "Space",
                            33: "PageUp",
                            34: "PageDown",
                            35: "End",
                            36: "Home",
                            37: "Left",
                            38: "Up",
                            39: "Right",
                            40: "Down",
                            44: "PrintScrn",
                            45: "Insert",
                            46: "Delete",
                            59: ";",
                            61: "=",
                            91: "Mod",
                            92: "Mod",
                            93: "Mod",
                            106: "*",
                            107: "=",
                            109: "-",
                            110: ".",
                            111: "/",
                            127: "Delete",
                            145: "ScrollLock",
                            173: "-",
                            186: ";",
                            187: "=",
                            188: ",",
                            189: "-",
                            190: ".",
                            191: "/",
                            192: "`",
                            219: "[",
                            220: "\\",
                            221: "]",
                            222: "'",
                            63232: "Up",
                            63233: "Down",
                            63234: "Left",
                            63235: "Right",
                            63272: "Delete",
                            63273: "Home",
                            63275: "End",
                            63276: "PageUp",
                            63277: "PageDown",
                            63302: "Insert",
                        },
                        Po = 0; Po < 10; Po++
                )
                    Wo[Po + 48] = Wo[Po + 96] = String(Po);
                for (var Ho = 65; Ho <= 90; Ho++) Wo[Ho] = String.fromCharCode(Ho);
                for (var Do = 1; Do <= 12; Do++) Wo[Do + 111] = Wo[Do + 63235] = "F" + Do;
                var Io = {};

                function jo(e) {
                    var t,
                        r,
                        n,
                        i,
                        o = e.split(/-(?!$)/);
                    e = o[o.length - 1];
                    for (var a = 0; a < o.length - 1; a++) {
                        var l = o[a];
                        if (/^(cmd|meta|m)$/i.test(l)) i = !0;
                        else if (/^a(lt)?$/i.test(l)) t = !0;
                        else if (/^(c|ctrl|control)$/i.test(l)) r = !0;
                        else {
                            if (!/^s(hift)?$/i.test(l)) throw new Error("Unrecognized modifier name: " + l);
                            n = !0;
                        }
                    }
                    return (
                        t && (e = "Alt-" + e),
                        r && (e = "Ctrl-" + e),
                        i && (e = "Cmd-" + e),
                        n && (e = "Shift-" + e),
                        e
                    );
                }

                function Fo(e) {
                    var t = {};
                    for (var r in e)
                        if (e.hasOwnProperty(r)) {
                            var n = e[r];
                            if (/^(name|fallthrough|(de|at)tach)$/.test(r)) continue;
                            if ("..." == n) {
                                delete e[r];
                                continue;
                            }
                            for (var i = Y(r.split(" "), jo), o = 0; o < i.length; o++) {
                                var a = void 0,
                                    l = void 0;
                                o == i.length - 1 ?
                                    ((l = i.join(" ")), (a = n)) :
                                    ((l = i.slice(0, o + 1).join(" ")), (a = "..."));
                                var s = t[l];
                                if (s) {
                                    if (s != a) throw new Error("Inconsistent bindings for " + l);
                                } else t[l] = a;
                            }
                            delete e[r];
                        }
                    for (var c in t) e[c] = t[c];
                    return e;
                }

                function Ro(e, t, r, n) {
                    var i = (t = qo(t)).call ? t.call(e, n) : t[e];
                    if (!1 === i) return "nothing";
                    if ("..." === i) return "multi";
                    if (null != i && r(i)) return "handled";
                    if (t.fallthrough) {
                        if ("[object Array]" != Object.prototype.toString.call(t.fallthrough))
                            return Ro(e, t.fallthrough, r, n);
                        for (var o = 0; o < t.fallthrough.length; o++) {
                            var a = Ro(e, t.fallthrough[o], r, n);
                            if (a) return a;
                        }
                    }
                }

                function _o(e) {
                    var t = "string" == typeof e ? e : Wo[e.keyCode];
                    return "Ctrl" == t || "Alt" == t || "Shift" == t || "Mod" == t;
                }

                function Bo(e, t, r) {
                    var n = e;
                    return (
                        t.altKey && "Alt" != n && (e = "Alt-" + e),
                        (k ? t.metaKey : t.ctrlKey) && "Ctrl" != n && (e = "Ctrl-" + e),
                        (k ? t.ctrlKey : t.metaKey) && "Cmd" != n && (e = "Cmd-" + e), !r && t.shiftKey && "Shift" != n && (e = "Shift-" + e),
                        e
                    );
                }

                function $o(e, t) {
                    if (d && 34 == e.keyCode && e.char) return !1;
                    var r = Wo[e.keyCode];
                    return (
                        null != r && !e.altGraphKey && (3 == e.keyCode && e.code && (r = e.code), Bo(r, e, t))
                    );
                }

                function qo(e) {
                    return "string" == typeof e ? Io[e] : e;
                }

                function Uo(e, t) {
                    for (var r = e.doc.sel.ranges, n = [], i = 0; i < r.length; i++) {
                        for (var o = t(r[i]); n.length && ge(o.from, X(n).to) <= 0;) {
                            var a = n.pop();
                            if (ge(a.from, o.from) < 0) {
                                o.from = a.from;
                                break;
                            }
                        }
                        n.push(o);
                    }
                    Vn(e, function() {
                        for (var t = n.length - 1; t >= 0; t--) so(e.doc, "", n[t].from, n[t].to, "+delete");
                        Ln(e);
                    });
                }

                function Vo(e, t, r) {
                    var n = oe(e.text, t + r, r);
                    return n < 0 || n > e.text.length ? null : n;
                }

                function Ko(e, t, r) {
                    var n = Vo(e, t.ch, r);
                    return null == n ? null : new me(t.line, n, r < 0 ? "after" : "before");
                }

                function Go(e, t, r, n, i) {
                    if (e) {
                        var o = Ze(r, t.doc.direction);
                        if (o) {
                            var a,
                                l = i < 0 ? X(o) : o[0],
                                s = i < 0 == (1 == l.level) ? "after" : "before";
                            if (l.level > 0 || "rtl" == t.doc.direction) {
                                var c = zr(t, r);
                                a = i < 0 ? r.text.length - 1 : 0;
                                var u = Nr(t, c, a).top;
                                (a = ae(
                                    function(e) {
                                        return Nr(t, c, e).top == u;
                                    },
                                    i < 0 == (1 == l.level) ? l.from : l.to - 1,
                                    a
                                )),
                                "before" == s && (a = Vo(r, a, 1));
                            } else a = i < 0 ? l.to : l.from;
                            return new me(n, a, s);
                        }
                    }
                    return new me(n, i < 0 ? r.text.length : 0, i < 0 ? "before" : "after");
                }
                (Io.basic = {
                    "Left": "goCharLeft",
                    "Right": "goCharRight",
                    "Up": "goLineUp",
                    "Down": "goLineDown",
                    "End": "goLineEnd",
                    "Home": "goLineStartSmart",
                    "PageUp": "goPageUp",
                    "PageDown": "goPageDown",
                    "Delete": "delCharAfter",
                    "Backspace": "delCharBefore",
                    "Shift-Backspace": "delCharBefore",
                    "Tab": "defaultTab",
                    "Shift-Tab": "indentAuto",
                    "Enter": "newlineAndIndent",
                    "Insert": "toggleOverwrite",
                    "Esc": "singleSelection",
                }),
                (Io.pcDefault = {
                    "Ctrl-A": "selectAll",
                    "Ctrl-D": "deleteLine",
                    "Ctrl-Z": "undo",
                    "Shift-Ctrl-Z": "redo",
                    "Ctrl-Y": "redo",
                    "Ctrl-Home": "goDocStart",
                    "Ctrl-End": "goDocEnd",
                    "Ctrl-Up": "goLineUp",
                    "Ctrl-Down": "goLineDown",
                    "Ctrl-Left": "goGroupLeft",
                    "Ctrl-Right": "goGroupRight",
                    "Alt-Left": "goLineStart",
                    "Alt-Right": "goLineEnd",
                    "Ctrl-Backspace": "delGroupBefore",
                    "Ctrl-Delete": "delGroupAfter",
                    "Ctrl-S": "save",
                    "Ctrl-F": "find",
                    "Ctrl-G": "findNext",
                    "Shift-Ctrl-G": "findPrev",
                    "Shift-Ctrl-F": "replace",
                    "Shift-Ctrl-R": "replaceAll",
                    "Ctrl-[": "indentLess",
                    "Ctrl-]": "indentMore",
                    "Ctrl-U": "undoSelection",
                    "Shift-Ctrl-U": "redoSelection",
                    "Alt-U": "redoSelection",
                    "fallthrough": "basic",
                }),
                (Io.emacsy = {
                    "Ctrl-F": "goCharRight",
                    "Ctrl-B": "goCharLeft",
                    "Ctrl-P": "goLineUp",
                    "Ctrl-N": "goLineDown",
                    "Alt-F": "goWordRight",
                    "Alt-B": "goWordLeft",
                    "Ctrl-A": "goLineStart",
                    "Ctrl-E": "goLineEnd",
                    "Ctrl-V": "goPageDown",
                    "Shift-Ctrl-V": "goPageUp",
                    "Ctrl-D": "delCharAfter",
                    "Ctrl-H": "delCharBefore",
                    "Alt-D": "delWordAfter",
                    "Alt-Backspace": "delWordBefore",
                    "Ctrl-K": "killLine",
                    "Ctrl-T": "transposeChars",
                    "Ctrl-O": "openLine",
                }),
                (Io.macDefault = {
                    "Cmd-A": "selectAll",
                    "Cmd-D": "deleteLine",
                    "Cmd-Z": "undo",
                    "Shift-Cmd-Z": "redo",
                    "Cmd-Y": "redo",
                    "Cmd-Home": "goDocStart",
                    "Cmd-Up": "goDocStart",
                    "Cmd-End": "goDocEnd",
                    "Cmd-Down": "goDocEnd",
                    "Alt-Left": "goGroupLeft",
                    "Alt-Right": "goGroupRight",
                    "Cmd-Left": "goLineLeft",
                    "Cmd-Right": "goLineRight",
                    "Alt-Backspace": "delGroupBefore",
                    "Ctrl-Alt-Backspace": "delGroupAfter",
                    "Alt-Delete": "delGroupAfter",
                    "Cmd-S": "save",
                    "Cmd-F": "find",
                    "Cmd-G": "findNext",
                    "Shift-Cmd-G": "findPrev",
                    "Cmd-Alt-F": "replace",
                    "Shift-Cmd-Alt-F": "replaceAll",
                    "Cmd-[": "indentLess",
                    "Cmd-]": "indentMore",
                    "Cmd-Backspace": "delWrappedLineLeft",
                    "Cmd-Delete": "delWrappedLineRight",
                    "Cmd-U": "undoSelection",
                    "Shift-Cmd-U": "redoSelection",
                    "Ctrl-Up": "goDocStart",
                    "Ctrl-Down": "goDocEnd",
                    "fallthrough": ["basic", "emacsy"],
                }),
                (Io.default = y ? Io.macDefault : Io.pcDefault);
                var Xo = {
                    selectAll: to,
                    singleSelection: function(e) {
                        return e.setSelection(e.getCursor("anchor"), e.getCursor("head"), $);
                    },
                    killLine: function(e) {
                        return Uo(e, function(t) {
                            if (t.empty()) {
                                var r = le(e.doc, t.head.line).text.length;
                                return t.head.ch == r && t.head.line < e.lastLine() ?
                                    { from: t.head, to: me(t.head.line + 1, 0) } :
                                    { from: t.head, to: me(t.head.line, r) };
                            }
                            return { from: t.from(), to: t.to() };
                        });
                    },
                    deleteLine: function(e) {
                        return Uo(e, function(t) {
                            return { from: me(t.from().line, 0), to: ke(e.doc, me(t.to().line + 1, 0)) };
                        });
                    },
                    delLineLeft: function(e) {
                        return Uo(e, function(e) {
                            return { from: me(e.from().line, 0), to: e.from() };
                        });
                    },
                    delWrappedLineLeft: function(e) {
                        return Uo(e, function(t) {
                            var r = e.charCoords(t.head, "div").top + 5;
                            return { from: e.coordsChar({ left: 0, top: r }, "div"), to: t.from() };
                        });
                    },
                    delWrappedLineRight: function(e) {
                        return Uo(e, function(t) {
                            var r = e.charCoords(t.head, "div").top + 5,
                                n = e.coordsChar({ left: e.display.lineDiv.offsetWidth + 100, top: r },
                                    "div"
                                );
                            return { from: t.from(), to: n };
                        });
                    },
                    undo: function(e) {
                        return e.undo();
                    },
                    redo: function(e) {
                        return e.redo();
                    },
                    undoSelection: function(e) {
                        return e.undoSelection();
                    },
                    redoSelection: function(e) {
                        return e.redoSelection();
                    },
                    goDocStart: function(e) {
                        return e.extendSelection(me(e.firstLine(), 0));
                    },
                    goDocEnd: function(e) {
                        return e.extendSelection(me(e.lastLine()));
                    },
                    goLineStart: function(e) {
                        return e.extendSelectionsBy(
                            function(t) {
                                return Yo(e, t.head.line);
                            }, { origin: "+move", bias: 1 }
                        );
                    },
                    goLineStartSmart: function(e) {
                        return e.extendSelectionsBy(
                            function(t) {
                                return Zo(e, t.head);
                            }, { origin: "+move", bias: 1 }
                        );
                    },
                    goLineEnd: function(e) {
                        return e.extendSelectionsBy(
                            function(t) {
                                return (function(e, t) {
                                    var r = le(e.doc, t),
                                        n = (function(e) {
                                            for (var t;
                                                (t = je(e));) e = t.find(1, !0).line;
                                            return e;
                                        })(r);
                                    n != r && (t = de(n));
                                    return Go(!0, e, r, t, -1);
                                })(e, t.head.line);
                            }, { origin: "+move", bias: -1 }
                        );
                    },
                    goLineRight: function(e) {
                        return e.extendSelectionsBy(function(t) {
                            var r = e.cursorCoords(t.head, "div").top + 5;
                            return e.coordsChar({ left: e.display.lineDiv.offsetWidth + 100, top: r }, "div");
                        }, U);
                    },
                    goLineLeft: function(e) {
                        return e.extendSelectionsBy(function(t) {
                            var r = e.cursorCoords(t.head, "div").top + 5;
                            return e.coordsChar({ left: 0, top: r }, "div");
                        }, U);
                    },
                    goLineLeftSmart: function(e) {
                        return e.extendSelectionsBy(function(t) {
                            var r = e.cursorCoords(t.head, "div").top + 5,
                                n = e.coordsChar({ left: 0, top: r }, "div");
                            return n.ch < e.getLine(n.line).search(/\S/) ? Zo(e, t.head) : n;
                        }, U);
                    },
                    goLineUp: function(e) {
                        return e.moveV(-1, "line");
                    },
                    goLineDown: function(e) {
                        return e.moveV(1, "line");
                    },
                    goPageUp: function(e) {
                        return e.moveV(-1, "page");
                    },
                    goPageDown: function(e) {
                        return e.moveV(1, "page");
                    },
                    goCharLeft: function(e) {
                        return e.moveH(-1, "char");
                    },
                    goCharRight: function(e) {
                        return e.moveH(1, "char");
                    },
                    goColumnLeft: function(e) {
                        return e.moveH(-1, "column");
                    },
                    goColumnRight: function(e) {
                        return e.moveH(1, "column");
                    },
                    goWordLeft: function(e) {
                        return e.moveH(-1, "word");
                    },
                    goGroupRight: function(e) {
                        return e.moveH(1, "group");
                    },
                    goGroupLeft: function(e) {
                        return e.moveH(-1, "group");
                    },
                    goWordRight: function(e) {
                        return e.moveH(1, "word");
                    },
                    delCharBefore: function(e) {
                        return e.deleteH(-1, "char");
                    },
                    delCharAfter: function(e) {
                        return e.deleteH(1, "char");
                    },
                    delWordBefore: function(e) {
                        return e.deleteH(-1, "word");
                    },
                    delWordAfter: function(e) {
                        return e.deleteH(1, "word");
                    },
                    delGroupBefore: function(e) {
                        return e.deleteH(-1, "group");
                    },
                    delGroupAfter: function(e) {
                        return e.deleteH(1, "group");
                    },
                    indentAuto: function(e) {
                        return e.indentSelection("smart");
                    },
                    indentMore: function(e) {
                        return e.indentSelection("add");
                    },
                    indentLess: function(e) {
                        return e.indentSelection("subtract");
                    },
                    insertTab: function(e) {
                        return e.replaceSelection("\t");
                    },
                    insertSoftTab: function(e) {
                        for (
                            var t = [], r = e.listSelections(), n = e.options.tabSize, i = 0; i < r.length; i++
                        ) {
                            var o = r[i].from(),
                                a = j(e.getLine(o.line), o.ch, n);
                            t.push(G(n - (a % n)));
                        }
                        e.replaceSelections(t);
                    },
                    defaultTab: function(e) {
                        e.somethingSelected() ? e.indentSelection("add") : e.execCommand("insertTab");
                    },
                    transposeChars: function(e) {
                        return Vn(e, function() {
                            for (var t = e.listSelections(), r = [], n = 0; n < t.length; n++)
                                if (t[n].empty()) {
                                    var i = t[n].head,
                                        o = le(e.doc, i.line).text;
                                    if (o)
                                        if ((i.ch == o.length && (i = new me(i.line, i.ch - 1)), i.ch > 0))
                                            (i = new me(i.line, i.ch + 1)),
                                            e.replaceRange(
                                                o.charAt(i.ch - 1) + o.charAt(i.ch - 2),
                                                me(i.line, i.ch - 2),
                                                i,
                                                "+transpose"
                                            );
                                        else if (i.line > e.doc.first) {
                                        var a = le(e.doc, i.line - 1).text;
                                        a &&
                                            ((i = new me(i.line, 1)),
                                                e.replaceRange(
                                                    o.charAt(0) +
                                                    e.doc.lineSeparator() +
                                                    a.charAt(a.length - 1),
                                                    me(i.line - 1, a.length - 1),
                                                    i,
                                                    "+transpose"
                                                ));
                                    }
                                    r.push(new vi(i, i));
                                }
                            e.setSelections(r);
                        });
                    },
                    newlineAndIndent: function(e) {
                        return Vn(e, function() {
                            for (var t = e.listSelections(), r = t.length - 1; r >= 0; r--)
                                e.replaceRange(e.doc.lineSeparator(), t[r].anchor, t[r].head, "+input");
                            t = e.listSelections();
                            for (var n = 0; n < t.length; n++) e.indentLine(t[n].from().line, null, !0);
                            Ln(e);
                        });
                    },
                    openLine: function(e) {
                        return e.replaceSelection("\n", "start");
                    },
                    toggleOverwrite: function(e) {
                        return e.toggleOverwrite();
                    },
                };

                function Yo(e, t) {
                    var r = le(e.doc, t),
                        n = Re(r);
                    return n != r && (t = de(n)), Go(!0, e, n, t, 1);
                }

                function Zo(e, t) {
                    var r = Yo(e, t.line),
                        n = le(e.doc, r.line),
                        i = Ze(n, e.doc.direction);
                    if (!i || 0 == i[0].level) {
                        var o = Math.max(0, n.text.search(/\S/)),
                            a = t.line == r.line && t.ch <= o && t.ch;
                        return me(r.line, a ? 0 : o, r.sticky);
                    }
                    return r;
                }

                function Qo(e, t, r) {
                    if ("string" == typeof t && !(t = Xo[t])) return !1;
                    e.display.input.ensurePolled();
                    var n = e.display.shift,
                        i = !1;
                    try {
                        e.isReadOnly() && (e.state.suppressEdits = !0),
                            r && (e.display.shift = !1),
                            (i = t(e) != B);
                    } finally {
                        (e.display.shift = n), (e.state.suppressEdits = !1);
                    }
                    return i;
                }
                var Jo = new F();

                function ea(e, t, r, n) {
                    var i = e.state.keySeq;
                    if (i) {
                        if (_o(t)) return "handled";
                        if (
                            (/\'$/.test(t) ?
                                (e.state.keySeq = null) :
                                Jo.set(50, function() {
                                    e.state.keySeq == i &&
                                        ((e.state.keySeq = null), e.display.input.reset());
                                }),
                                ta(e, i + " " + t, r, n))
                        )
                            return !0;
                    }
                    return ta(e, t, r, n);
                }

                function ta(e, t, r, n) {
                    var i = (function(e, t, r) {
                        for (var n = 0; n < e.state.keyMaps.length; n++) {
                            var i = Ro(t, e.state.keyMaps[n], r, e);
                            if (i) return i;
                        }
                        return (
                            (e.options.extraKeys && Ro(t, e.options.extraKeys, r, e)) ||
                            Ro(t, e.options.keyMap, r, e)
                        );
                    })(e, t, n);
                    return (
                        "multi" == i && (e.state.keySeq = t),
                        "handled" == i && ar(e, "keyHandled", e, t, r),
                        ("handled" != i && "multi" != i) || (lt(r), hn(e)), !!i
                    );
                }

                function ra(e, t) {
                    var r = $o(t, !0);
                    return (!!r &&
                        (t.shiftKey && !e.state.keySeq ?
                            ea(e, "Shift-" + r, t, function(t) {
                                return Qo(e, t, !0);
                            }) ||
                            ea(e, r, t, function(t) {
                                if ("string" == typeof t ? /^go[A-Z]/.test(t) : t.motion) return Qo(e, t);
                            }) :
                            ea(e, r, t, function(t) {
                                return Qo(e, t);
                            }))
                    );
                }
                var na = null;

                function ia(e) {
                    var t = this;
                    if (((t.curOp.focus = E()), !nt(t, e))) {
                        a && l < 11 && 27 == e.keyCode && (e.returnValue = !1);
                        var r = e.keyCode;
                        t.display.shift = 16 == r || e.shiftKey;
                        var n = ra(t, e);
                        d &&
                            ((na = n ? r : null), !n &&
                                88 == r &&
                                !xt &&
                                (y ? e.metaKey : e.ctrlKey) &&
                                t.replaceSelection("", null, "cut")),
                            18 != r ||
                            /\bCodeMirror-crosshair\b/.test(t.display.lineDiv.className) ||
                            (function(e) {
                                var t = e.display.lineDiv;

                                function r(e) {
                                    (18 != e.keyCode && e.altKey) ||
                                    (M(t, "CodeMirror-crosshair"),
                                        tt(document, "keyup", r),
                                        tt(document, "mouseover", r));
                                }
                                W(t, "CodeMirror-crosshair"),
                                    Je(document, "keyup", r),
                                    Je(document, "mouseover", r);
                            })(t);
                    }
                }

                function oa(e) {
                    16 == e.keyCode && (this.doc.sel.shift = !1), nt(this, e);
                }

                function aa(e) {
                    var t = this;
                    if (!(wr(t.display, e) || nt(t, e) || (e.ctrlKey && !e.altKey) || (y && e.metaKey))) {
                        var r = e.keyCode,
                            n = e.charCode;
                        if (d && r == na) return (na = null), void lt(e);
                        if (!d || (e.which && !(e.which < 10)) || !ra(t, e)) {
                            var i = String.fromCharCode(null == n ? r : n);
                            "\b" != i &&
                                ((function(e, t, r) {
                                        return ea(e, "'" + r + "'", t, function(t) {
                                            return Qo(e, t, !0);
                                        });
                                    })(t, e, i) ||
                                    t.display.input.onKeyPress(e));
                        }
                    }
                }
                var la,
                    sa,
                    ca = function(e, t, r) {
                        (this.time = e), (this.pos = t), (this.button = r);
                    };

                function ua(e) {
                    var t = this,
                        r = t.display;
                    if (!(nt(t, e) || (r.activeTouch && r.input.supportsTouch())))
                        if ((r.input.ensurePolled(), (r.shift = e.shiftKey), wr(r, e)))
                            s ||
                            ((r.scroller.draggable = !1),
                                setTimeout(function() {
                                    return (r.scroller.draggable = !0);
                                }, 100));
                        else if (!ha(t, e)) {
                        var n = an(t, e),
                            i = ft(e),
                            o = n ?
                            (function(e, t) {
                                var r = +new Date();
                                return sa && sa.compare(r, e, t) ?
                                    ((la = sa = null), "triple") :
                                    la && la.compare(r, e, t) ?
                                    ((sa = new ca(r, e, t)), (la = null), "double") :
                                    ((la = new ca(r, e, t)), (sa = null), "single");
                            })(n, i) :
                            "single";
                        window.focus(),
                            1 == i && t.state.selectingText && t.state.selectingText(e),
                            (n &&
                                (function(e, t, r, n, i) {
                                    var o = "Click";
                                    "double" == n
                                        ?
                                        (o = "Double" + o) :
                                        "triple" == n && (o = "Triple" + o);
                                    return ea(
                                        e,
                                        Bo((o = (1 == t ? "Left" : 2 == t ? "Middle" : "Right") + o), i),
                                        i,
                                        function(t) {
                                            if (("string" == typeof t && (t = Xo[t]), !t)) return !1;
                                            var n = !1;
                                            try {
                                                e.isReadOnly() && (e.state.suppressEdits = !0),
                                                    (n = t(e, r) != B);
                                            } finally {
                                                e.state.suppressEdits = !1;
                                            }
                                            return n;
                                        }
                                    );
                                })(t, i, n, o, e)) ||
                            (1 == i ?
                                n ?
                                (function(e, t, r, n) {
                                    a ? setTimeout(D(pn, e), 0) : (e.curOp.focus = E());
                                    var i,
                                        o = (function(e, t, r) {
                                            var n = e.getOption("configureMouse"),
                                                i = n ? n(e, t, r) : {};
                                            if (null == i.unit) {
                                                var o = b ? r.shiftKey && r.metaKey : r.altKey;
                                                i.unit = o ?
                                                    "rectangle" :
                                                    "single" == t ?
                                                    "char" :
                                                    "double" == t ?
                                                    "word" :
                                                    "line";
                                            }
                                            (null == i.extend || e.doc.extend) &&
                                            (i.extend = e.doc.extend || r.shiftKey);
                                            null == i.addNew &&
                                                (i.addNew = y ? r.metaKey : r.ctrlKey);
                                            null == i.moveOnDrag &&
                                                (i.moveOnDrag = !(y ? r.altKey : r.ctrlKey));
                                            return i;
                                        })(e, r, n),
                                        c = e.doc.sel;
                                    e.options.dragDrop &&
                                        mt &&
                                        !e.isReadOnly() &&
                                        "single" == r &&
                                        (i = c.contains(t)) > -1 &&
                                        (ge((i = c.ranges[i]).from(), t) < 0 || t.xRel > 0) &&
                                        (ge(i.to(), t) > 0 || t.xRel < 0) ?
                                        (function(e, t, r, n) {
                                            var i = e.display,
                                                o = !1,
                                                c = Kn(e, function(t) {
                                                    s && (i.scroller.draggable = !1),
                                                        (e.state.draggingText = !1),
                                                        tt(document, "mouseup", c),
                                                        tt(document, "mousemove", u),
                                                        tt(i.scroller, "dragstart", d),
                                                        tt(i.scroller, "drop", c),
                                                        o ||
                                                        (lt(t),
                                                            n.addNew ||
                                                            Bi(
                                                                e.doc,
                                                                r,
                                                                null,
                                                                null,
                                                                n.extend
                                                            ),
                                                            s || (a && 9 == l) ?
                                                            setTimeout(function() {
                                                                document.body.focus(),
                                                                    i.input.focus();
                                                            }, 20) :
                                                            i.input.focus());
                                                }),
                                                u = function(e) {
                                                    o =
                                                        o ||
                                                        Math.abs(t.clientX - e.clientX) +
                                                        Math.abs(t.clientY - e.clientY) >=
                                                        10;
                                                },
                                                d = function() {
                                                    return (o = !0);
                                                };
                                            s && (i.scroller.draggable = !0);
                                            (e.state.draggingText = c),
                                            (c.copy = !n.moveOnDrag),
                                            i.scroller.dragDrop && i.scroller.dragDrop();
                                            Je(document, "mouseup", c),
                                                Je(document, "mousemove", u),
                                                Je(i.scroller, "dragstart", d),
                                                Je(i.scroller, "drop", c),
                                                mn(e),
                                                setTimeout(function() {
                                                    return i.input.focus();
                                                }, 20);
                                        })(e, n, t, o) :
                                        (function(e, t, r, n) {
                                            var i = e.display,
                                                o = e.doc;
                                            lt(t);
                                            var a,
                                                l,
                                                s = o.sel,
                                                c = s.ranges;
                                            n.addNew && !n.extend ?
                                                ((l = o.sel.contains(r)),
                                                    (a = l > -1 ? c[l] : new vi(r, r))) :
                                                ((a = o.sel.primary()),
                                                    (l = o.sel.primIndex));
                                            if ("rectangle" == n.unit)
                                                n.addNew || (a = new vi(r, r)),
                                                (r = an(e, t, !0, !0)),
                                                (l = -1);
                                            else {
                                                var u = da(e, r, n.unit);
                                                a = n.extend ?
                                                    _i(a, u.anchor, u.head, n.extend) :
                                                    u;
                                            }
                                            n.addNew ?
                                                -1 == l ?
                                                ((l = c.length),
                                                    Ki(o, yi(c.concat([a]), l), {
                                                        scroll: !1,
                                                        origin: "*mouse",
                                                    })) :
                                                c.length > 1 &&
                                                c[l].empty() &&
                                                "char" == n.unit &&
                                                !n.extend ?
                                                (Ki(
                                                        o,
                                                        yi(
                                                            c
                                                            .slice(0, l)
                                                            .concat(c.slice(l + 1)),
                                                            0
                                                        ), { scroll: !1, origin: "*mouse" }
                                                    ),
                                                    (s = o.sel)) :
                                                qi(o, l, a, q) :
                                                ((l = 0),
                                                    Ki(o, new gi([a], 0), q),
                                                    (s = o.sel));
                                            var d = r;

                                            function f(t) {
                                                if (0 != ge(d, t))
                                                    if (((d = t), "rectangle" == n.unit)) {
                                                        for (
                                                            var i = [],
                                                                c = e.options.tabSize,
                                                                u = j(
                                                                    le(o, r.line).text,
                                                                    r.ch,
                                                                    c
                                                                ),
                                                                f = j(
                                                                    le(o, t.line).text,
                                                                    t.ch,
                                                                    c
                                                                ),
                                                                h = Math.min(u, f),
                                                                p = Math.max(u, f),
                                                                m = Math.min(r.line, t.line),
                                                                g = Math.min(
                                                                    e.lastLine(),
                                                                    Math.max(r.line, t.line)
                                                                ); m <= g; m++
                                                        ) {
                                                            var v = le(o, m).text,
                                                                y = V(v, h, c);
                                                            h == p ?
                                                                i.push(
                                                                    new vi(
                                                                        me(m, y),
                                                                        me(m, y)
                                                                    )
                                                                ) :
                                                                v.length > y &&
                                                                i.push(
                                                                    new vi(
                                                                        me(m, y),
                                                                        me(m, V(v, p, c))
                                                                    )
                                                                );
                                                        }
                                                        i.length || i.push(new vi(r, r)),
                                                            Ki(
                                                                o,
                                                                yi(
                                                                    s.ranges
                                                                    .slice(0, l)
                                                                    .concat(i),
                                                                    l
                                                                ), {
                                                                    origin: "*mouse",
                                                                    scroll: !1,
                                                                }
                                                            ),
                                                            e.scrollIntoView(t);
                                                    } else {
                                                        var b,
                                                            w = a,
                                                            x = da(e, t, n.unit),
                                                            k = w.anchor;
                                                        ge(x.anchor, k) > 0 ?
                                                            ((b = x.head),
                                                                (k = we(w.from(), x.anchor))) :
                                                            ((b = x.anchor),
                                                                (k = be(w.to(), x.head)));
                                                        var C = s.ranges.slice(0);
                                                        (C[l] = (function(e, t) {
                                                            var r = t.anchor,
                                                                n = t.head,
                                                                i = le(e.doc, r.line);
                                                            if (
                                                                0 == ge(r, n) &&
                                                                r.sticky == n.sticky
                                                            )
                                                                return t;
                                                            var o = Ze(i);
                                                            if (!o) return t;
                                                            var a = Xe(o, r.ch, r.sticky),
                                                                l = o[a];
                                                            if (
                                                                l.from != r.ch &&
                                                                l.to != r.ch
                                                            )
                                                                return t;
                                                            var s,
                                                                c =
                                                                a +
                                                                ((l.from == r.ch) ==
                                                                    (1 != l.level) ?
                                                                    0 :
                                                                    1);
                                                            if (0 == c || c == o.length)
                                                                return t;
                                                            if (n.line != r.line)
                                                                s =
                                                                (n.line - r.line) *
                                                                ("ltr" ==
                                                                    e.doc.direction ?
                                                                    1 :
                                                                    -1) >
                                                                0;
                                                            else {
                                                                var u = Xe(o, n.ch, n.sticky),
                                                                    d =
                                                                    u - a ||
                                                                    (n.ch - r.ch) *
                                                                    (1 == l.level ?
                                                                        -1 :
                                                                        1);
                                                                s =
                                                                    u == c - 1 || u == c ?
                                                                    d < 0 :
                                                                    d > 0;
                                                            }
                                                            var f = o[c + (s ? -1 : 0)],
                                                                h = s == (1 == f.level),
                                                                p = h ? f.from : f.to,
                                                                m = h ? "after" : "before";
                                                            return r.ch == p && r.sticky == m ?
                                                                t :
                                                                new vi(
                                                                    new me(r.line, p, m),
                                                                    n
                                                                );
                                                        })(e, new vi(ke(o, k), b))),
                                                        Ki(o, yi(C, l), q);
                                                    }
                                            }
                                            var h = i.wrapper.getBoundingClientRect(),
                                                p = 0;

                                            function m(t) {
                                                (e.state.selectingText = !1),
                                                (p = 1 / 0),
                                                lt(t),
                                                    i.input.focus(),
                                                    tt(document, "mousemove", g),
                                                    tt(document, "mouseup", v),
                                                    (o.history.lastSelOrigin = null);
                                            }
                                            var g = Kn(e, function(t) {
                                                    ft(t) ?
                                                        (function t(r) {
                                                            var a = ++p;
                                                            var l = an(
                                                                e,
                                                                r, !0,
                                                                "rectangle" == n.unit
                                                            );
                                                            if (!l) return;
                                                            if (0 != ge(l, d)) {
                                                                (e.curOp.focus = E()), f(l);
                                                                var s = wn(i, o);
                                                                (l.line >= s.to ||
                                                                    l.line < s.from) &&
                                                                setTimeout(
                                                                    Kn(e, function() {
                                                                        p == a && t(r);
                                                                    }),
                                                                    150
                                                                );
                                                            } else {
                                                                var c =
                                                                    r.clientY < h.top ?
                                                                    -20 :
                                                                    r.clientY >
                                                                    h.bottom ?
                                                                    20 :
                                                                    0;
                                                                c &&
                                                                    setTimeout(
                                                                        Kn(e, function() {
                                                                            p == a &&
                                                                                ((i.scroller.scrollTop += c),
                                                                                    t(r));
                                                                        }),
                                                                        50
                                                                    );
                                                            }
                                                        })(t) :
                                                        m(t);
                                                }),
                                                v = Kn(e, m);
                                            (e.state.selectingText = v),
                                            Je(document, "mousemove", g),
                                                Je(document, "mouseup", v);
                                        })(e, n, t, o);
                                })(t, n, o, e) :
                                dt(e) == r.scroller && lt(e) :
                                2 == i ?
                                (n && Bi(t.doc, n),
                                    setTimeout(function() {
                                        return r.input.focus();
                                    }, 20)) :
                                3 == i && (C ? pa(t, e) : mn(t)));
                    }
                }

                function da(e, t, r) {
                    if ("char" == r) return new vi(t, t);
                    if ("word" == r) return e.findWordAt(t);
                    if ("line" == r) return new vi(me(t.line, 0), ke(e.doc, me(t.line + 1, 0)));
                    var n = r(e, t);
                    return new vi(n.from, n.to);
                }

                function fa(e, t, r, n) {
                    var i, o;
                    if (t.touches)(i = t.touches[0].clientX), (o = t.touches[0].clientY);
                    else
                        try {
                            (i = t.clientX), (o = t.clientY);
                        } catch (t) {
                            return !1;
                        }
                    if (i >= Math.floor(e.display.gutters.getBoundingClientRect().right)) return !1;
                    n && lt(t);
                    var a = e.display,
                        l = a.lineDiv.getBoundingClientRect();
                    if (o > l.bottom || !ot(e, r)) return ct(t);
                    o -= l.top - a.viewOffset;
                    for (var s = 0; s < e.options.gutters.length; ++s) {
                        var c = a.gutters.childNodes[s];
                        if (c && c.getBoundingClientRect().right >= i)
                            return rt(e, r, e, fe(e.doc, o), e.options.gutters[s], t), ct(t);
                    }
                }

                function ha(e, t) {
                    return fa(e, t, "gutterClick", !0);
                }

                function pa(e, t) {
                    wr(e.display, t) ||
                        (function(e, t) {
                            if (!ot(e, "gutterContextMenu")) return !1;
                            return fa(e, t, "gutterContextMenu", !1);
                        })(e, t) ||
                        nt(e, t, "contextmenu") ||
                        e.display.input.onContextMenu(t);
                }

                function ma(e) {
                    (e.display.wrapper.className =
                        e.display.wrapper.className.replace(/\s*cm-s-\S+/g, "") +
                        e.options.theme.replace(/(^|\s)\s*/g, " cm-s-")),
                    jr(e);
                }
                ca.prototype.compare = function(e, t, r) {
                    return this.time + 400 > e && 0 == ge(t, this.pos) && r == this.button;
                };
                var ga = {
                        toString: function() {
                            return "CodeMirror.Init";
                        },
                    },
                    va = {},
                    ya = {};

                function ba(e) {
                    ci(e), Yn(e), xn(e);
                }

                function wa(e, t, r) {
                    if (!t != !(r && r != ga)) {
                        var n = e.display.dragFunctions,
                            i = t ? Je : tt;
                        i(e.display.scroller, "dragstart", n.start),
                            i(e.display.scroller, "dragenter", n.enter),
                            i(e.display.scroller, "dragover", n.over),
                            i(e.display.scroller, "dragleave", n.leave),
                            i(e.display.scroller, "drop", n.drop);
                    }
                }

                function xa(e) {
                    e.options.lineWrapping ?
                        (W(e.display.wrapper, "CodeMirror-wrap"),
                            (e.display.sizer.style.minWidth = ""),
                            (e.display.sizerWidth = null)) :
                        (M(e.display.wrapper, "CodeMirror-wrap"), Ke(e)),
                        on(e),
                        Yn(e),
                        jr(e),
                        setTimeout(function() {
                            return Hn(e);
                        }, 100);
                }

                function ka(e, t) {
                    var n = this;
                    if (!(this instanceof ka)) return new ka(e, t);
                    (this.options = t = t ? I(t) : {}), I(va, t, !1), ui(t);
                    var i = t.value;
                    "string" == typeof i && (i = new Lo(i, t.mode, null, t.lineSeparator, t.direction)),
                        (this.doc = i);
                    var o = new ka.inputStyles[t.inputStyle](this),
                        c = (this.display = new(function(e, t, n) {
                            var i = this;
                            (this.input = n),
                            (i.scrollbarFiller = A("div", null, "CodeMirror-scrollbar-filler")),
                            i.scrollbarFiller.setAttribute("cm-not-content", "true"),
                                (i.gutterFiller = A("div", null, "CodeMirror-gutter-filler")),
                                i.gutterFiller.setAttribute("cm-not-content", "true"),
                                (i.lineDiv = z("div", null, "CodeMirror-code")),
                                (i.selectionDiv = A("div", null, null, "position: relative; z-index: 1")),
                                (i.cursorDiv = A("div", null, "CodeMirror-cursors")),
                                (i.measure = A("div", null, "CodeMirror-measure")),
                                (i.lineMeasure = A("div", null, "CodeMirror-measure")),
                                (i.lineSpace = z(
                                    "div", [i.measure, i.lineMeasure, i.selectionDiv, i.cursorDiv, i.lineDiv],
                                    null,
                                    "position: relative; outline: none"
                                ));
                            var o = z("div", [i.lineSpace], "CodeMirror-lines");
                            (i.mover = A("div", [o], null, "position: relative")),
                            (i.sizer = A("div", [i.mover], "CodeMirror-sizer")),
                            (i.sizerWidth = null),
                            (i.heightForcer = A(
                                "div",
                                null,
                                null,
                                "position: absolute; height: " + _ + "px; width: 1px;"
                            )),
                            (i.gutters = A("div", null, "CodeMirror-gutters")),
                            (i.lineGutter = null),
                            (i.scroller = A(
                                "div", [i.sizer, i.heightForcer, i.gutters],
                                "CodeMirror-scroll"
                            )),
                            i.scroller.setAttribute("tabIndex", "-1"),
                                (i.wrapper = A(
                                    "div", [i.scrollbarFiller, i.gutterFiller, i.scroller],
                                    "CodeMirror"
                                )),
                                a &&
                                l < 8 &&
                                ((i.gutters.style.zIndex = -1), (i.scroller.style.paddingRight = 0)),
                                s || (r && v) || (i.scroller.draggable = !0),
                                e && (e.appendChild ? e.appendChild(i.wrapper) : e(i.wrapper)),
                                (i.viewFrom = i.viewTo = t.first),
                                (i.reportedViewFrom = i.reportedViewTo = t.first),
                                (i.view = []),
                                (i.renderedView = null),
                                (i.externalMeasured = null),
                                (i.viewOffset = 0),
                                (i.lastWrapHeight = i.lastWrapWidth = 0),
                                (i.updateLineNumbers = null),
                                (i.nativeBarWidth = i.barHeight = i.barWidth = 0),
                                (i.scrollbarsClipped = !1),
                                (i.lineNumWidth = i.lineNumInnerWidth = i.lineNumChars = null),
                                (i.alignWidgets = !1),
                                (i.cachedCharWidth = i.cachedTextHeight = i.cachedPaddingH = null),
                                (i.maxLine = null),
                                (i.maxLineLength = 0),
                                (i.maxLineChanged = !1),
                                (i.wheelDX = i.wheelDY = i.wheelStartX = i.wheelStartY = null),
                                (i.shift = !1),
                                (i.selForContextMenu = null),
                                (i.activeTouch = null),
                                n.init(i);
                        })(e, i, o));
                    for (var u in ((c.wrapper.CodeMirror = this),
                            ci(this),
                            ma(this),
                            t.lineWrapping && (this.display.wrapper.className += " CodeMirror-wrap"),
                            jn(this),
                            (this.state = {
                                keyMaps: [],
                                overlays: [],
                                modeGen: 0,
                                overwrite: !1,
                                delayingBlurEvent: !1,
                                focused: !1,
                                suppressEdits: !1,
                                pasteIncoming: !1,
                                cutIncoming: !1,
                                selectingText: !1,
                                draggingText: !1,
                                highlight: new F(),
                                keySeq: null,
                                specialChars: null,
                            }),
                            t.autofocus && !v && c.input.focus(),
                            a &&
                            l < 11 &&
                            setTimeout(function() {
                                return n.display.input.reset(!0);
                            }, 20),
                            (function(e) {
                                var t = e.display;
                                Je(t.scroller, "mousedown", Kn(e, ua)),
                                    Je(
                                        t.scroller,
                                        "dblclick",
                                        a && l < 11 ?
                                        Kn(e, function(t) {
                                            if (!nt(e, t)) {
                                                var r = an(e, t);
                                                if (r && !ha(e, t) && !wr(e.display, t)) {
                                                    lt(t);
                                                    var n = e.findWordAt(r);
                                                    Bi(e.doc, n.anchor, n.head);
                                                }
                                            }
                                        }) :
                                        function(t) {
                                            return nt(e, t) || lt(t);
                                        }
                                    );
                                C ||
                                    Je(t.scroller, "contextmenu", function(t) {
                                        return pa(e, t);
                                    });
                                var r,
                                    n = { end: 0 };

                                function i() {
                                    t.activeTouch &&
                                        ((r = setTimeout(function() {
                                                return (t.activeTouch = null);
                                            }, 1e3)),
                                            ((n = t.activeTouch).end = +new Date()));
                                }

                                function o(e, t) {
                                    if (null == t.left) return !0;
                                    var r = t.left - e.left,
                                        n = t.top - e.top;
                                    return r * r + n * n > 400;
                                }
                                Je(t.scroller, "touchstart", function(i) {
                                        if (!nt(e, i) &&
                                            !(function(e) {
                                                if (1 != e.touches.length) return !1;
                                                var t = e.touches[0];
                                                return t.radiusX <= 1 && t.radiusY <= 1;
                                            })(i) &&
                                            !ha(e, i)
                                        ) {
                                            t.input.ensurePolled(), clearTimeout(r);
                                            var o = +new Date();
                                            (t.activeTouch = { start: o, moved: !1, prev: o - n.end <= 300 ? n : null }),
                                            1 == i.touches.length &&
                                                ((t.activeTouch.left = i.touches[0].pageX),
                                                    (t.activeTouch.top = i.touches[0].pageY));
                                        }
                                    }),
                                    Je(t.scroller, "touchmove", function() {
                                        t.activeTouch && (t.activeTouch.moved = !0);
                                    }),
                                    Je(t.scroller, "touchend", function(r) {
                                        var n = t.activeTouch;
                                        if (
                                            n &&
                                            !wr(t, r) &&
                                            null != n.left &&
                                            !n.moved &&
                                            new Date() - n.start < 300
                                        ) {
                                            var a,
                                                l = e.coordsChar(t.activeTouch, "page");
                                            (a = !n.prev || o(n, n.prev) ?
                                                new vi(l, l) :
                                                !n.prev.prev || o(n, n.prev.prev) ?
                                                e.findWordAt(l) :
                                                new vi(me(l.line, 0), ke(e.doc, me(l.line + 1, 0)))),
                                            e.setSelection(a.anchor, a.head),
                                                e.focus(),
                                                lt(r);
                                        }
                                        i();
                                    }),
                                    Je(t.scroller, "touchcancel", i),
                                    Je(t.scroller, "scroll", function() {
                                        t.scroller.clientHeight &&
                                            (An(e, t.scroller.scrollTop),
                                                Nn(e, t.scroller.scrollLeft, !0),
                                                rt(e, "scroll", e));
                                    }),
                                    Je(t.scroller, "mousewheel", function(t) {
                                        return mi(e, t);
                                    }),
                                    Je(t.scroller, "DOMMouseScroll", function(t) {
                                        return mi(e, t);
                                    }),
                                    Je(t.wrapper, "scroll", function() {
                                        return (t.wrapper.scrollTop = t.wrapper.scrollLeft = 0);
                                    }),
                                    (t.dragFunctions = {
                                        enter: function(t) {
                                            nt(e, t) || ut(t);
                                        },
                                        over: function(t) {
                                            nt(e, t) ||
                                                (!(function(e, t) {
                                                        var r = an(e, t);
                                                        if (r) {
                                                            var n = document.createDocumentFragment();
                                                            un(e, r, n),
                                                                e.display.dragCursor ||
                                                                ((e.display.dragCursor = A(
                                                                        "div",
                                                                        null,
                                                                        "CodeMirror-cursors CodeMirror-dragcursors"
                                                                    )),
                                                                    e.display.lineSpace.insertBefore(
                                                                        e.display.dragCursor,
                                                                        e.display.cursorDiv
                                                                    )),
                                                                O(e.display.dragCursor, n);
                                                        }
                                                    })(e, t),
                                                    ut(t));
                                        },
                                        start: function(t) {
                                            return (function(e, t) {
                                                if (a && (!e.state.draggingText || +new Date() - Mo < 100)) ut(t);
                                                else if (!nt(e, t) &&
                                                    !wr(e.display, t) &&
                                                    (t.dataTransfer.setData("Text", e.getSelection()),
                                                        (t.dataTransfer.effectAllowed = "copyMove"),
                                                        t.dataTransfer.setDragImage && !f)
                                                ) {
                                                    var r = A("img", null, null, "position: fixed; left: 0; top: 0;");
                                                    (r.src =
                                                        "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="),
                                                    d &&
                                                        ((r.width = r.height = 1),
                                                            e.display.wrapper.appendChild(r),
                                                            (r._top = r.offsetTop)),
                                                        t.dataTransfer.setDragImage(r, 0, 0),
                                                        d && r.parentNode.removeChild(r);
                                                }
                                            })(e, t);
                                        },
                                        drop: Kn(e, To),
                                        leave: function(t) {
                                            nt(e, t) || Oo(e);
                                        },
                                    });
                                var s = t.input.getField();
                                Je(s, "keyup", function(t) {
                                        return oa.call(e, t);
                                    }),
                                    Je(s, "keydown", Kn(e, ia)),
                                    Je(s, "keypress", Kn(e, aa)),
                                    Je(s, "focus", function(t) {
                                        return gn(e, t);
                                    }),
                                    Je(s, "blur", function(t) {
                                        return vn(e, t);
                                    });
                            })(this),
                            No(),
                            Rn(this),
                            (this.curOp.forceUpdate = !0),
                            Ai(this, i),
                            (t.autofocus && !v) || this.hasFocus() ? setTimeout(D(gn, this), 20) : vn(this),
                            ya))
                        ya.hasOwnProperty(u) && ya[u](n, t[u], ga);
                    kn(this), t.finishInit && t.finishInit(this);
                    for (var h = 0; h < Ca.length; ++h) Ca[h](n);
                    _n(this),
                        s &&
                        t.lineWrapping &&
                        "optimizelegibility" == getComputedStyle(c.lineDiv).textRendering &&
                        (c.lineDiv.style.textRendering = "auto");
                }
                (ka.defaults = va), (ka.optionHandlers = ya);
                var Ca = [];

                function Sa(e, t, r, n) {
                    var i,
                        o = e.doc;
                    null == r && (r = "add"),
                        "smart" == r && (o.mode.indent ? (i = It(e, t).state) : (r = "prev"));
                    var a = e.options.tabSize,
                        l = le(o, t),
                        s = j(l.text, null, a);
                    l.stateAfter && (l.stateAfter = null);
                    var c,
                        u = l.text.match(/^\s*/)[0];
                    if (n || /\S/.test(l.text)) {
                        if (
                            "smart" == r &&
                            ((c = o.mode.indent(i, l.text.slice(u.length), l.text)) == B || c > 150)
                        ) {
                            if (!n) return;
                            r = "prev";
                        }
                    } else(c = 0), (r = "not");
                    "prev" == r
                        ?
                        (c = t > o.first ? j(le(o, t - 1).text, null, a) : 0) :
                        "add" == r ?
                        (c = s + e.options.indentUnit) :
                        "subtract" == r ?
                        (c = s - e.options.indentUnit) :
                        "number" == typeof r && (c = s + r),
                        (c = Math.max(0, c));
                    var d = "",
                        f = 0;
                    if (e.options.indentWithTabs)
                        for (var h = Math.floor(c / a); h; --h)(f += a), (d += "\t");
                    if ((f < c && (d += G(c - f)), d != u))
                        return so(o, d, me(t, 0), me(t, u.length), "+input"), (l.stateAfter = null), !0;
                    for (var p = 0; p < o.sel.ranges.length; p++) {
                        var m = o.sel.ranges[p];
                        if (m.head.line == t && m.head.ch < u.length) {
                            var g = me(t, u.length);
                            qi(o, p, new vi(g, g));
                            break;
                        }
                    }
                }
                ka.defineInitHook = function(e) {
                    return Ca.push(e);
                };
                var La = null;

                function Ma(e) {
                    La = e;
                }

                function Ta(e, t, r, n, i) {
                    var o = e.doc;
                    (e.display.shift = !1), n || (n = o.sel);
                    var a,
                        l = e.state.pasteIncoming || "paste" == i,
                        s = bt(t),
                        c = null;
                    if (l && n.ranges.length > 1)
                        if (La && La.text.join("\n") == t) {
                            if (n.ranges.length % La.text.length == 0) {
                                c = [];
                                for (var u = 0; u < La.text.length; u++) c.push(o.splitLines(La.text[u]));
                            }
                        } else
                            s.length == n.ranges.length &&
                            e.options.pasteLinesPerSelection &&
                            (c = Y(s, function(e) {
                                return [e];
                            }));
                    for (var d = n.ranges.length - 1; d >= 0; d--) {
                        var f = n.ranges[d],
                            h = f.from(),
                            p = f.to();
                        f.empty() &&
                            (r && r > 0 ?
                                (h = me(h.line, h.ch - r)) :
                                e.state.overwrite && !l ?
                                (p = me(p.line, Math.min(le(o, p.line).text.length, p.ch + X(s).length))) :
                                La && La.lineWise && La.text.join("\n") == t && (h = p = me(h.line, 0))),
                            (a = e.curOp.updateInput);
                        var m = {
                            from: h,
                            to: p,
                            text: c ? c[d % c.length] : s,
                            origin: i || (l ? "paste" : e.state.cutIncoming ? "cut" : "+input"),
                        };
                        no(e.doc, m), ar(e, "inputRead", e, m);
                    }
                    t && !l && Aa(e, t),
                        Ln(e),
                        (e.curOp.updateInput = a),
                        (e.curOp.typing = !0),
                        (e.state.pasteIncoming = e.state.cutIncoming = !1);
                }

                function Oa(e, t) {
                    var r = e.clipboardData && e.clipboardData.getData("Text");
                    if (r)
                        return (
                            e.preventDefault(),
                            t.isReadOnly() ||
                            t.options.disableInput ||
                            Vn(t, function() {
                                return Ta(t, r, 0, null, "paste");
                            }), !0
                        );
                }

                function Aa(e, t) {
                    if (e.options.electricChars && e.options.smartIndent)
                        for (var r = e.doc.sel, n = r.ranges.length - 1; n >= 0; n--) {
                            var i = r.ranges[n];
                            if (!(i.head.ch > 100 || (n && r.ranges[n - 1].head.line == i.head.line))) {
                                var o = e.getModeAt(i.head),
                                    a = !1;
                                if (o.electricChars) {
                                    for (var l = 0; l < o.electricChars.length; l++)
                                        if (t.indexOf(o.electricChars.charAt(l)) > -1) {
                                            a = Sa(e, i.head.line, "smart");
                                            break;
                                        }
                                } else
                                    o.electricInput &&
                                    o.electricInput.test(
                                        le(e.doc, i.head.line).text.slice(0, i.head.ch)
                                    ) &&
                                    (a = Sa(e, i.head.line, "smart"));
                                a && ar(e, "electricInput", e, i.head.line);
                            }
                        }
                }

                function za(e) {
                    for (var t = [], r = [], n = 0; n < e.doc.sel.ranges.length; n++) {
                        var i = e.doc.sel.ranges[n].head.line,
                            o = { anchor: me(i, 0), head: me(i + 1, 0) };
                        r.push(o), t.push(e.getRange(o.anchor, o.head));
                    }
                    return { text: t, ranges: r };
                }

                function Na(e, t) {
                    e.setAttribute("autocorrect", "off"),
                        e.setAttribute("autocapitalize", "off"),
                        e.setAttribute("spellcheck", !!t);
                }

                function Ea() {
                    var e = A(
                            "textarea",
                            null,
                            null,
                            "position: absolute; bottom: -1em; padding: 0; width: 1px; height: 1em; outline: none"
                        ),
                        t = A(
                            "div", [e],
                            null,
                            "overflow: hidden; position: relative; width: 3px; height: 0px;"
                        );
                    return (
                        s ? (e.style.width = "1000px") : e.setAttribute("wrap", "off"),
                        m && (e.style.border = "1px solid black"),
                        Na(e),
                        t
                    );
                }

                function Wa(e, t, r, n, i) {
                    var o = t,
                        a = r,
                        l = le(e, t.line);

                    function s(n) {
                        var o, a;
                        if (
                            null ==
                            (o = i ?
                                (function(e, t, r, n) {
                                    var i = Ze(t, e.doc.direction);
                                    if (!i) return Ko(t, r, n);
                                    r.ch >= t.text.length ?
                                        ((r.ch = t.text.length), (r.sticky = "before")) :
                                        r.ch <= 0 && ((r.ch = 0), (r.sticky = "after"));
                                    var o = Xe(i, r.ch, r.sticky),
                                        a = i[o];
                                    if (
                                        "ltr" == e.doc.direction &&
                                        a.level % 2 == 0 &&
                                        (n > 0 ? a.to > r.ch : a.from < r.ch)
                                    )
                                        return Ko(t, r, n);
                                    var l,
                                        s = function(e, r) {
                                            return Vo(t, e instanceof me ? e.ch : e, r);
                                        },
                                        c = function(r) {
                                            return e.options.lineWrapping ?
                                                ((l = l || zr(e, t)), Yr(e, t, l, r)) :
                                                { begin: 0, end: t.text.length };
                                        },
                                        u = c("before" == r.sticky ? s(r, -1) : r.ch);
                                    if ("rtl" == e.doc.direction || 1 == a.level) {
                                        var d = (1 == a.level) == n < 0,
                                            f = s(r, d ? 1 : -1);
                                        if (
                                            null != f &&
                                            (d ? f <= a.to && f <= u.end : f >= a.from && f >= u.begin)
                                        ) {
                                            var h = d ? "before" : "after";
                                            return new me(r.line, f, h);
                                        }
                                    }
                                    var p = function(e, t, n) {
                                            for (
                                                var o = function(e, t) {
                                                    return t ?
                                                        new me(r.line, s(e, 1), "before") :
                                                        new me(r.line, e, "after");
                                                }; e >= 0 && e < i.length; e += t
                                            ) {
                                                var a = i[e],
                                                    l = t > 0 == (1 != a.level),
                                                    c = l ? n.begin : s(n.end, -1);
                                                if (a.from <= c && c < a.to) return o(c, l);
                                                if (
                                                    ((c = l ? a.from : s(a.to, -1)),
                                                        n.begin <= c && c < n.end)
                                                )
                                                    return o(c, l);
                                            }
                                        },
                                        m = p(o + n, n, u);
                                    if (m) return m;
                                    var g = n > 0 ? u.end : s(u.begin, -1);
                                    return null == g ||
                                        (n > 0 && g == t.text.length) ||
                                        !(m = p(n > 0 ? 0 : i.length - 1, n, c(g))) ?
                                        null :
                                        m;
                                })(e.cm, l, t, r) :
                                Ko(l, t, r))
                        ) {
                            if (
                                n ||
                                (a = t.line + r) < e.first ||
                                a >= e.first + e.size ||
                                ((t = new me(a, t.ch, t.sticky)), !(l = le(e, a)))
                            )
                                return !1;
                            t = Go(i, e.cm, l, t.line, r);
                        } else t = o;
                        return !0;
                    }
                    if ("char" == n) s();
                    else if ("column" == n) s(!0);
                    else if ("word" == n || "group" == n)
                        for (
                            var c = null,
                                u = "group" == n,
                                d = e.cm && e.cm.getHelper(t, "wordChars"),
                                f = !0; !(r < 0) || s(!f); f = !1
                        ) {
                            var h = l.text.charAt(t.ch) || "\n",
                                p = te(h, d) ? "w" : u && "\n" == h ? "n" : !u || /\s/.test(h) ? null : "p";
                            if ((!u || f || p || (p = "s"), c && c != p)) {
                                r < 0 && ((r = 1), s(), (t.sticky = "after"));
                                break;
                            }
                            if ((p && (c = p), r > 0 && !s(!f))) break;
                        }
                    var m = Ji(e, t, o, a, !0);
                    return ve(o, m) && (m.hitSide = !0), m;
                }

                function Pa(e, t, r, n) {
                    var i,
                        o,
                        a = e.doc,
                        l = t.left;
                    if ("page" == n) {
                        var s = Math.min(
                                e.display.wrapper.clientHeight,
                                window.innerHeight || document.documentElement.clientHeight
                            ),
                            c = Math.max(s - 0.5 * Jr(e.display), 3);
                        i = (r > 0 ? t.bottom : t.top) + r * c;
                    } else "line" == n && (i = r > 0 ? t.bottom + 3 : t.top - 3);
                    for (;
                        (o = Gr(e, l, i)).outside;) {
                        if (r < 0 ? i <= 0 : i >= a.height) {
                            o.hitSide = !0;
                            break;
                        }
                        i += 5 * r;
                    }
                    return o;
                }
                var Ha = function(e) {
                    (this.cm = e),
                    (this.lastAnchorNode = this.lastAnchorOffset = this.lastFocusNode = this.lastFocusOffset = null),
                    (this.polling = new F()),
                    (this.composing = null),
                    (this.gracePeriod = !1),
                    (this.readDOMTimeout = null);
                };

                function Da(e, t) {
                    var r = Ar(e, t.line);
                    if (!r || r.hidden) return null;
                    var n = le(e.doc, t.line),
                        i = Tr(r, n, t.line),
                        o = Ze(n, e.doc.direction),
                        a = "left";
                    o && (a = Xe(o, t.ch) % 2 ? "right" : "left");
                    var l = Pr(i.map, t.ch, a);
                    return (l.offset = "right" == l.collapse ? l.end : l.start), l;
                }

                function Ia(e, t) {
                    return t && (e.bad = !0), e;
                }

                function ja(e, t, r) {
                    var n;
                    if (t == e.display.lineDiv) {
                        if (!(n = e.display.lineDiv.childNodes[r]))
                            return Ia(e.clipPos(me(e.display.viewTo - 1)), !0);
                        (t = null), (r = 0);
                    } else
                        for (n = t;; n = n.parentNode) {
                            if (!n || n == e.display.lineDiv) return null;
                            if (n.parentNode && n.parentNode == e.display.lineDiv) break;
                        }
                    for (var i = 0; i < e.display.view.length; i++) {
                        var o = e.display.view[i];
                        if (o.node == n) return Fa(o, t, r);
                    }
                }

                function Fa(e, t, r) {
                    var n = e.text.firstChild,
                        i = !1;
                    if (!t || !N(n, t)) return Ia(me(de(e.line), 0), !0);
                    if (t == n && ((i = !0), (t = n.childNodes[r]), (r = 0), !t)) {
                        var o = e.rest ? X(e.rest) : e.line;
                        return Ia(me(de(o), o.text.length), i);
                    }
                    var a = 3 == t.nodeType ? t : null,
                        l = t;
                    for (
                        a ||
                        1 != t.childNodes.length ||
                        3 != t.firstChild.nodeType ||
                        ((a = t.firstChild), r && (r = a.nodeValue.length)); l.parentNode != n;

                    )
                        l = l.parentNode;
                    var s = e.measure,
                        c = s.maps;

                    function u(t, r, n) {
                        for (var i = -1; i < (c ? c.length : 0); i++)
                            for (var o = i < 0 ? s.map : c[i], a = 0; a < o.length; a += 3) {
                                var l = o[a + 2];
                                if (l == t || l == r) {
                                    var u = de(i < 0 ? e.line : e.rest[i]),
                                        d = o[a] + n;
                                    return (n < 0 || l != t) && (d = o[a + (n ? 1 : 0)]), me(u, d);
                                }
                            }
                    }
                    var d = u(a, l, r);
                    if (d) return Ia(d, i);
                    for (var f = l.nextSibling, h = a ? a.nodeValue.length - r : 0; f; f = f.nextSibling) {
                        if ((d = u(f, f.firstChild, 0))) return Ia(me(d.line, d.ch - h), i);
                        h += f.textContent.length;
                    }
                    for (var p = l.previousSibling, m = r; p; p = p.previousSibling) {
                        if ((d = u(p, p.firstChild, -1))) return Ia(me(d.line, d.ch + m), i);
                        m += p.textContent.length;
                    }
                }
                (Ha.prototype.init = function(e) {
                    var t = this,
                        r = this,
                        n = r.cm,
                        i = (r.div = e.lineDiv);

                    function o(e) {
                        if (!nt(n, e)) {
                            if (n.somethingSelected())
                                Ma({ lineWise: !1, text: n.getSelections() }),
                                "cut" == e.type && n.replaceSelection("", null, "cut");
                            else {
                                if (!n.options.lineWiseCopyCut) return;
                                var t = za(n);
                                Ma({ lineWise: !0, text: t.text }),
                                    "cut" == e.type &&
                                    n.operation(function() {
                                        n.setSelections(t.ranges, 0, $),
                                            n.replaceSelection("", null, "cut");
                                    });
                            }
                            if (e.clipboardData) {
                                e.clipboardData.clearData();
                                var o = La.text.join("\n");
                                if (
                                    (e.clipboardData.setData("Text", o), e.clipboardData.getData("Text") == o)
                                )
                                    return void e.preventDefault();
                            }
                            var a = Ea(),
                                l = a.firstChild;
                            n.display.lineSpace.insertBefore(a, n.display.lineSpace.firstChild),
                                (l.value = La.text.join("\n"));
                            var s = document.activeElement;
                            H(l),
                                setTimeout(function() {
                                    n.display.lineSpace.removeChild(a),
                                        s.focus(),
                                        s == i && r.showPrimarySelection();
                                }, 50);
                        }
                    }
                    Na(i, n.options.spellcheck),
                        Je(i, "paste", function(e) {
                            nt(n, e) ||
                                Oa(e, n) ||
                                (l <= 11 &&
                                    setTimeout(
                                        Kn(n, function() {
                                            return t.updateFromDOM();
                                        }),
                                        20
                                    ));
                        }),
                        Je(i, "compositionstart", function(e) {
                            t.composing = { data: e.data, done: !1 };
                        }),
                        Je(i, "compositionupdate", function(e) {
                            t.composing || (t.composing = { data: e.data, done: !1 });
                        }),
                        Je(i, "compositionend", function(e) {
                            t.composing &&
                                (e.data != t.composing.data && t.readFromDOMSoon(), (t.composing.done = !0));
                        }),
                        Je(i, "touchstart", function() {
                            return r.forceCompositionEnd();
                        }),
                        Je(i, "input", function() {
                            t.composing || t.readFromDOMSoon();
                        }),
                        Je(i, "copy", o),
                        Je(i, "cut", o);
                }),
                (Ha.prototype.prepareSelection = function() {
                    var e = cn(this.cm, !1);
                    return (e.focus = this.cm.state.focused), e;
                }),
                (Ha.prototype.showSelection = function(e, t) {
                    e &&
                        this.cm.display.view.length &&
                        ((e.focus || t) && this.showPrimarySelection(), this.showMultipleSelections(e));
                }),
                (Ha.prototype.showPrimarySelection = function() {
                    var e = window.getSelection(),
                        t = this.cm,
                        n = t.doc.sel.primary(),
                        i = n.from(),
                        o = n.to();
                    if (
                        t.display.viewTo == t.display.viewFrom ||
                        i.line >= t.display.viewTo ||
                        o.line < t.display.viewFrom
                    )
                        e.removeAllRanges();
                    else {
                        var a = ja(t, e.anchorNode, e.anchorOffset),
                            l = ja(t, e.focusNode, e.focusOffset);
                        if (!a || a.bad || !l || l.bad || 0 != ge(we(a, l), i) || 0 != ge(be(a, l), o)) {
                            var s = t.display.view,
                                c = (i.line >= t.display.viewFrom && Da(t, i)) || {
                                    node: s[0].measure.map[2],
                                    offset: 0,
                                },
                                u = o.line < t.display.viewTo && Da(t, o);
                            if (!u) {
                                var d = s[s.length - 1].measure,
                                    f = d.maps ? d.maps[d.maps.length - 1] : d.map;
                                u = { node: f[f.length - 1], offset: f[f.length - 2] - f[f.length - 3] };
                            }
                            if (c && u) {
                                var h,
                                    p = e.rangeCount && e.getRangeAt(0);
                                try {
                                    h = L(c.node, c.offset, u.offset, u.node);
                                } catch (e) {}
                                h &&
                                    (!r && t.state.focused ?
                                        (e.collapse(c.node, c.offset),
                                            h.collapsed || (e.removeAllRanges(), e.addRange(h))) :
                                        (e.removeAllRanges(), e.addRange(h)),
                                        p && null == e.anchorNode ?
                                        e.addRange(p) :
                                        r && this.startGracePeriod()),
                                    this.rememberSelection();
                            } else e.removeAllRanges();
                        }
                    }
                }),
                (Ha.prototype.startGracePeriod = function() {
                    var e = this;
                    clearTimeout(this.gracePeriod),
                        (this.gracePeriod = setTimeout(function() {
                            (e.gracePeriod = !1),
                            e.selectionChanged() &&
                                e.cm.operation(function() {
                                    return (e.cm.curOp.selectionChanged = !0);
                                });
                        }, 20));
                }),
                (Ha.prototype.showMultipleSelections = function(e) {
                    O(this.cm.display.cursorDiv, e.cursors), O(this.cm.display.selectionDiv, e.selection);
                }),
                (Ha.prototype.rememberSelection = function() {
                    var e = window.getSelection();
                    (this.lastAnchorNode = e.anchorNode),
                    (this.lastAnchorOffset = e.anchorOffset),
                    (this.lastFocusNode = e.focusNode),
                    (this.lastFocusOffset = e.focusOffset);
                }),
                (Ha.prototype.selectionInEditor = function() {
                    var e = window.getSelection();
                    if (!e.rangeCount) return !1;
                    var t = e.getRangeAt(0).commonAncestorContainer;
                    return N(this.div, t);
                }),
                (Ha.prototype.focus = function() {
                    "nocursor" != this.cm.options.readOnly &&
                        (this.selectionInEditor() || this.showSelection(this.prepareSelection(), !0),
                            this.div.focus());
                }),
                (Ha.prototype.blur = function() {
                    this.div.blur();
                }),
                (Ha.prototype.getField = function() {
                    return this.div;
                }),
                (Ha.prototype.supportsTouch = function() {
                    return !0;
                }),
                (Ha.prototype.receivedFocus = function() {
                    var e = this;
                    this.selectionInEditor() ?
                        this.pollSelection() :
                        Vn(this.cm, function() {
                            return (e.cm.curOp.selectionChanged = !0);
                        }),
                        this.polling.set(this.cm.options.pollInterval, function t() {
                            e.cm.state.focused &&
                                (e.pollSelection(), e.polling.set(e.cm.options.pollInterval, t));
                        });
                }),
                (Ha.prototype.selectionChanged = function() {
                    var e = window.getSelection();
                    return (
                        e.anchorNode != this.lastAnchorNode ||
                        e.anchorOffset != this.lastAnchorOffset ||
                        e.focusNode != this.lastFocusNode ||
                        e.focusOffset != this.lastFocusOffset
                    );
                }),
                (Ha.prototype.pollSelection = function() {
                    if (null == this.readDOMTimeout && !this.gracePeriod && this.selectionChanged()) {
                        var e = window.getSelection(),
                            t = this.cm;
                        if (
                            g &&
                            u &&
                            this.cm.options.gutters.length &&
                            (function(e) {
                                for (var t = e; t; t = t.parentNode)
                                    if (/CodeMirror-gutter-wrapper/.test(t.className)) return !0;
                                return !1;
                            })(e.anchorNode)
                        )
                            return (
                                this.cm.triggerOnKeyDown({
                                    type: "keydown",
                                    keyCode: 8,
                                    preventDefault: Math.abs,
                                }),
                                this.blur(),
                                void this.focus()
                            );
                        if (!this.composing) {
                            this.rememberSelection();
                            var r = ja(t, e.anchorNode, e.anchorOffset),
                                n = ja(t, e.focusNode, e.focusOffset);
                            r &&
                                n &&
                                Vn(t, function() {
                                    Ki(t.doc, bi(r, n), $),
                                        (r.bad || n.bad) && (t.curOp.selectionChanged = !0);
                                });
                        }
                    }
                }),
                (Ha.prototype.pollContent = function() {
                    null != this.readDOMTimeout &&
                        (clearTimeout(this.readDOMTimeout), (this.readDOMTimeout = null));
                    var e,
                        t,
                        r,
                        n = this.cm,
                        i = n.display,
                        o = n.doc.sel.primary(),
                        a = o.from(),
                        l = o.to();
                    if (
                        (0 == a.ch &&
                            a.line > n.firstLine() &&
                            (a = me(a.line - 1, le(n.doc, a.line - 1).length)),
                            l.ch == le(n.doc, l.line).text.length &&
                            l.line < n.lastLine() &&
                            (l = me(l.line + 1, 0)),
                            a.line < i.viewFrom || l.line > i.viewTo - 1)
                    )
                        return !1;
                    a.line == i.viewFrom || 0 == (e = ln(n, a.line)) ?
                        ((t = de(i.view[0].line)), (r = i.view[0].node)) :
                        ((t = de(i.view[e].line)), (r = i.view[e - 1].node.nextSibling));
                    var s,
                        c,
                        u = ln(n, l.line);
                    if (
                        (u == i.view.length - 1 ?
                            ((s = i.viewTo - 1), (c = i.lineDiv.lastChild)) :
                            ((s = de(i.view[u + 1].line) - 1),
                                (c = i.view[u + 1].node.previousSibling)), !r)
                    )
                        return !1;
                    for (
                        var d = n.doc.splitLines(
                                (function(e, t, r, n, i) {
                                    var o = "",
                                        a = !1,
                                        l = e.doc.lineSeparator();

                                    function s() {
                                        a && ((o += l), (a = !1));
                                    }

                                    function c(e) {
                                        e && (s(), (o += e));
                                    }

                                    function u(t) {
                                        if (1 == t.nodeType) {
                                            var r = t.getAttribute("cm-text");
                                            if (null != r)
                                                return void c(r || t.textContent.replace(/\u200b/g, ""));
                                            var o,
                                                d = t.getAttribute("cm-marker");
                                            if (d) {
                                                var f = e.findMarks(
                                                    me(n, 0),
                                                    me(i + 1, 0),
                                                    ((m = +d),
                                                        function(e) {
                                                            return e.id == m;
                                                        })
                                                );
                                                return void(
                                                    f.length &&
                                                    (o = f[0].find(0)) &&
                                                    c(se(e.doc, o.from, o.to).join(l))
                                                );
                                            }
                                            if ("false" == t.getAttribute("contenteditable")) return;
                                            var h = /^(pre|div|p)$/i.test(t.nodeName);
                                            h && s();
                                            for (var p = 0; p < t.childNodes.length; p++)
                                                u(t.childNodes[p]);
                                            h && (a = !0);
                                        } else 3 == t.nodeType && c(t.nodeValue);
                                        var m;
                                    }
                                    for (; u(t), t != r;) t = t.nextSibling;
                                    return o;
                                })(n, r, c, t, s)
                            ),
                            f = se(n.doc, me(t, 0), me(s, le(n.doc, s).text.length)); d.length > 1 && f.length > 1;

                    )
                        if (X(d) == X(f)) d.pop(), f.pop(), s--;
                        else {
                            if (d[0] != f[0]) break;
                            d.shift(), f.shift(), t++;
                        }
                    for (
                        var h = 0, p = 0, m = d[0], g = f[0], v = Math.min(m.length, g.length); h < v && m.charCodeAt(h) == g.charCodeAt(h);

                    )
                        ++h;
                    for (
                        var y = X(d),
                            b = X(f),
                            w = Math.min(
                                y.length - (1 == d.length ? h : 0),
                                b.length - (1 == f.length ? h : 0)
                            ); p < w && y.charCodeAt(y.length - p - 1) == b.charCodeAt(b.length - p - 1);

                    )
                        ++p;
                    if (1 == d.length && 1 == f.length && t == a.line)
                        for (; h &&
                            h > a.ch &&
                            y.charCodeAt(y.length - p - 1) == b.charCodeAt(b.length - p - 1);

                        )
                            h--, p++;
                    (d[d.length - 1] = y.slice(0, y.length - p).replace(/^\u200b+/, "")),
                    (d[0] = d[0].slice(h).replace(/\u200b+$/, ""));
                    var x = me(t, h),
                        k = me(s, f.length ? X(f).length - p : 0);
                    return d.length > 1 || d[0] || ge(x, k) ? (so(n.doc, d, x, k, "+input"), !0) : void 0;
                }),
                (Ha.prototype.ensurePolled = function() {
                    this.forceCompositionEnd();
                }),
                (Ha.prototype.reset = function() {
                    this.forceCompositionEnd();
                }),
                (Ha.prototype.forceCompositionEnd = function() {
                    this.composing &&
                        (clearTimeout(this.readDOMTimeout),
                            (this.composing = null),
                            this.updateFromDOM(),
                            this.div.blur(),
                            this.div.focus());
                }),
                (Ha.prototype.readFromDOMSoon = function() {
                    var e = this;
                    null == this.readDOMTimeout &&
                        (this.readDOMTimeout = setTimeout(function() {
                            if (((e.readDOMTimeout = null), e.composing)) {
                                if (!e.composing.done) return;
                                e.composing = null;
                            }
                            e.updateFromDOM();
                        }, 80));
                }),
                (Ha.prototype.updateFromDOM = function() {
                    var e = this;
                    (!this.cm.isReadOnly() && this.pollContent()) ||
                    Vn(this.cm, function() {
                        return Yn(e.cm);
                    });
                }),
                (Ha.prototype.setUneditable = function(e) {
                    e.contentEditable = "false";
                }),
                (Ha.prototype.onKeyPress = function(e) {
                    0 != e.charCode &&
                        (e.preventDefault(),
                            this.cm.isReadOnly() ||
                            Kn(this.cm, Ta)(
                                this.cm,
                                String.fromCharCode(null == e.charCode ? e.keyCode : e.charCode),
                                0
                            ));
                }),
                (Ha.prototype.readOnlyChanged = function(e) {
                    this.div.contentEditable = String("nocursor" != e);
                }),
                (Ha.prototype.onContextMenu = function() {}),
                (Ha.prototype.resetPosition = function() {}),
                (Ha.prototype.needsContentAttribute = !0);
                var Ra = function(e) {
                    (this.cm = e),
                    (this.prevInput = ""),
                    (this.pollingFast = !1),
                    (this.polling = new F()),
                    (this.hasSelection = !1),
                    (this.composing = null);
                };
                (Ra.prototype.init = function(e) {
                    var t = this,
                        r = this,
                        n = this.cm,
                        i = (this.wrapper = Ea()),
                        o = (this.textarea = i.firstChild);

                    function s(e) {
                        if (!nt(n, e)) {
                            if (n.somethingSelected()) Ma({ lineWise: !1, text: n.getSelections() });
                            else {
                                if (!n.options.lineWiseCopyCut) return;
                                var t = za(n);
                                Ma({ lineWise: !0, text: t.text }),
                                    "cut" == e.type ?
                                    n.setSelections(t.ranges, null, $) :
                                    ((r.prevInput = ""), (o.value = t.text.join("\n")), H(o));
                            }
                            "cut" == e.type && (n.state.cutIncoming = !0);
                        }
                    }
                    e.wrapper.insertBefore(i, e.wrapper.firstChild),
                        m && (o.style.width = "0px"),
                        Je(o, "input", function() {
                            a && l >= 9 && t.hasSelection && (t.hasSelection = null), r.poll();
                        }),
                        Je(o, "paste", function(e) {
                            nt(n, e) || Oa(e, n) || ((n.state.pasteIncoming = !0), r.fastPoll());
                        }),
                        Je(o, "cut", s),
                        Je(o, "copy", s),
                        Je(e.scroller, "paste", function(t) {
                            wr(e, t) || nt(n, t) || ((n.state.pasteIncoming = !0), r.focus());
                        }),
                        Je(e.lineSpace, "selectstart", function(t) {
                            wr(e, t) || lt(t);
                        }),
                        Je(o, "compositionstart", function() {
                            var e = n.getCursor("from");
                            r.composing && r.composing.range.clear(),
                                (r.composing = {
                                    start: e,
                                    range: n.markText(e, n.getCursor("to"), {
                                        className: "CodeMirror-composing",
                                    }),
                                });
                        }),
                        Je(o, "compositionend", function() {
                            r.composing && (r.poll(), r.composing.range.clear(), (r.composing = null));
                        });
                }),
                (Ra.prototype.prepareSelection = function() {
                    var e = this.cm,
                        t = e.display,
                        r = e.doc,
                        n = cn(e);
                    if (e.options.moveInputWithCursor) {
                        var i = Ur(e, r.sel.primary().head, "div"),
                            o = t.wrapper.getBoundingClientRect(),
                            a = t.lineDiv.getBoundingClientRect();
                        (n.teTop = Math.max(
                            0,
                            Math.min(t.wrapper.clientHeight - 10, i.top + a.top - o.top)
                        )),
                        (n.teLeft = Math.max(
                            0,
                            Math.min(t.wrapper.clientWidth - 10, i.left + a.left - o.left)
                        ));
                    }
                    return n;
                }),
                (Ra.prototype.showSelection = function(e) {
                    var t = this.cm.display;
                    O(t.cursorDiv, e.cursors),
                        O(t.selectionDiv, e.selection),
                        null != e.teTop &&
                        ((this.wrapper.style.top = e.teTop + "px"),
                            (this.wrapper.style.left = e.teLeft + "px"));
                }),
                (Ra.prototype.reset = function(e) {
                    if (!this.contextMenuPending && !this.composing) {
                        var t = this.cm;
                        if (t.somethingSelected()) {
                            this.prevInput = "";
                            var r = t.getSelection();
                            (this.textarea.value = r),
                            t.state.focused && H(this.textarea),
                                a && l >= 9 && (this.hasSelection = r);
                        } else
                            e ||
                            ((this.prevInput = this.textarea.value = ""),
                                a && l >= 9 && (this.hasSelection = null));
                    }
                }),
                (Ra.prototype.getField = function() {
                    return this.textarea;
                }),
                (Ra.prototype.supportsTouch = function() {
                    return !1;
                }),
                (Ra.prototype.focus = function() {
                    if ("nocursor" != this.cm.options.readOnly && (!v || E() != this.textarea))
                        try {
                            this.textarea.focus();
                        } catch (e) {}
                }),
                (Ra.prototype.blur = function() {
                    this.textarea.blur();
                }),
                (Ra.prototype.resetPosition = function() {
                    this.wrapper.style.top = this.wrapper.style.left = 0;
                }),
                (Ra.prototype.receivedFocus = function() {
                    this.slowPoll();
                }),
                (Ra.prototype.slowPoll = function() {
                    var e = this;
                    this.pollingFast ||
                        this.polling.set(this.cm.options.pollInterval, function() {
                            e.poll(), e.cm.state.focused && e.slowPoll();
                        });
                }),
                (Ra.prototype.fastPoll = function() {
                    var e = !1,
                        t = this;
                    (t.pollingFast = !0),
                    t.polling.set(20, function r() {
                        t.poll() || e ?
                            ((t.pollingFast = !1), t.slowPoll()) :
                            ((e = !0), t.polling.set(60, r));
                    });
                }),
                (Ra.prototype.poll = function() {
                    var e = this,
                        t = this.cm,
                        r = this.textarea,
                        n = this.prevInput;
                    if (
                        this.contextMenuPending ||
                        !t.state.focused ||
                        (wt(r) && !n && !this.composing) ||
                        t.isReadOnly() ||
                        t.options.disableInput ||
                        t.state.keySeq
                    )
                        return !1;
                    var i = r.value;
                    if (i == n && !t.somethingSelected()) return !1;
                    if ((a && l >= 9 && this.hasSelection === i) || (y && /[\uf700-\uf7ff]/.test(i)))
                        return t.display.input.reset(), !1;
                    if (t.doc.sel == t.display.selForContextMenu) {
                        var o = i.charCodeAt(0);
                        if ((8203 != o || n || (n = "​"), 8666 == o))
                            return this.reset(), this.cm.execCommand("undo");
                    }
                    for (
                        var s = 0, c = Math.min(n.length, i.length); s < c && n.charCodeAt(s) == i.charCodeAt(s);

                    )
                        ++s;
                    return (
                        Vn(t, function() {
                            Ta(t, i.slice(s), n.length - s, null, e.composing ? "*compose" : null),
                                i.length > 1e3 || i.indexOf("\n") > -1 ?
                                (r.value = e.prevInput = "") :
                                (e.prevInput = i),
                                e.composing &&
                                (e.composing.range.clear(),
                                    (e.composing.range = t.markText(
                                        e.composing.start,
                                        t.getCursor("to"), { className: "CodeMirror-composing" }
                                    )));
                        }), !0
                    );
                }),
                (Ra.prototype.ensurePolled = function() {
                    this.pollingFast && this.poll() && (this.pollingFast = !1);
                }),
                (Ra.prototype.onKeyPress = function() {
                    a && l >= 9 && (this.hasSelection = null), this.fastPoll();
                }),
                (Ra.prototype.onContextMenu = function(e) {
                    var t = this,
                        r = t.cm,
                        n = r.display,
                        i = t.textarea,
                        o = an(r, e),
                        c = n.scroller.scrollTop;
                    if (o && !d) {
                        r.options.resetSelectionOnContextMenu &&
                            -1 == r.doc.sel.contains(o) &&
                            Kn(r, Ki)(r.doc, bi(o), $);
                        var u = i.style.cssText,
                            f = t.wrapper.style.cssText;
                        t.wrapper.style.cssText = "position: absolute";
                        var h,
                            p = t.wrapper.getBoundingClientRect();
                        if (
                            ((i.style.cssText =
                                    "position: absolute; width: 30px; height: 30px;\n      top: " +
                                    (e.clientY - p.top - 5) +
                                    "px; left: " +
                                    (e.clientX - p.left - 5) +
                                    "px;\n      z-index: 1000; background: " +
                                    (a ? "rgba(255, 255, 255, .05)" : "transparent") +
                                    ";\n      outline: none; border-width: 0; outline: none; overflow: hidden; opacity: .05; filter: alpha(opacity=5);"),
                                s && (h = window.scrollY),
                                n.input.focus(),
                                s && window.scrollTo(null, h),
                                n.input.reset(),
                                r.somethingSelected() || (i.value = t.prevInput = " "),
                                (t.contextMenuPending = !0),
                                (n.selForContextMenu = r.doc.sel),
                                clearTimeout(n.detectingSelectAll),
                                a && l >= 9 && g(),
                                C)
                        ) {
                            ut(e);
                            var m = function() {
                                tt(window, "mouseup", m), setTimeout(v, 20);
                            };
                            Je(window, "mouseup", m);
                        } else setTimeout(v, 50);
                    }

                    function g() {
                        if (null != i.selectionStart) {
                            var e = r.somethingSelected(),
                                o = "​" + (e ? i.value : "");
                            (i.value = "⇚"),
                            (i.value = o),
                            (t.prevInput = e ? "" : "​"),
                            (i.selectionStart = 1),
                            (i.selectionEnd = o.length),
                            (n.selForContextMenu = r.doc.sel);
                        }
                    }

                    function v() {
                        if (
                            ((t.contextMenuPending = !1),
                                (t.wrapper.style.cssText = f),
                                (i.style.cssText = u),
                                a && l < 9 && n.scrollbars.setScrollTop((n.scroller.scrollTop = c)),
                                null != i.selectionStart)
                        ) {
                            (!a || (a && l < 9)) && g();
                            var e = 0,
                                o = function() {
                                    n.selForContextMenu == r.doc.sel &&
                                        0 == i.selectionStart &&
                                        i.selectionEnd > 0 &&
                                        "​" == t.prevInput ?
                                        Kn(r, to)(r) :
                                        e++ < 10 ?
                                        (n.detectingSelectAll = setTimeout(o, 500)) :
                                        ((n.selForContextMenu = null), n.input.reset());
                                };
                            n.detectingSelectAll = setTimeout(o, 200);
                        }
                    }
                }),
                (Ra.prototype.readOnlyChanged = function(e) {
                    e || this.reset(), (this.textarea.disabled = "nocursor" == e);
                }),
                (Ra.prototype.setUneditable = function() {}),
                (Ra.prototype.needsContentAttribute = !1),
                (function(e) {
                    var t = e.optionHandlers;

                    function r(r, n, i, o) {
                        (e.defaults[r] = n),
                        i &&
                            (t[r] = o ?

                                function(e, t, r) {
                                    r != ga && i(e, t, r);
                                } :
                                i);
                    }
                    (e.defineOption = r),
                    (e.Init = ga),
                    r(
                            "value",
                            "",
                            function(e, t) {
                                return e.setValue(t);
                            }, !0
                        ),
                        r(
                            "mode",
                            null,
                            function(e, t) {
                                (e.doc.modeOption = t), Si(e);
                            }, !0
                        ),
                        r("indentUnit", 2, Si, !0),
                        r("indentWithTabs", !1),
                        r("smartIndent", !0),
                        r(
                            "tabSize",
                            4,
                            function(e) {
                                Li(e), jr(e), Yn(e);
                            }, !0
                        ),
                        r("lineSeparator", null, function(e, t) {
                            if (((e.doc.lineSep = t), t)) {
                                var r = [],
                                    n = e.doc.first;
                                e.doc.iter(function(e) {
                                    for (var i = 0;;) {
                                        var o = e.text.indexOf(t, i);
                                        if (-1 == o) break;
                                        (i = o + t.length), r.push(me(n, o));
                                    }
                                    n++;
                                });
                                for (var i = r.length - 1; i >= 0; i--)
                                    so(e.doc, t, r[i], me(r[i].line, r[i].ch + t.length));
                            }
                        }),
                        r(
                            "specialChars",
                            /[\u0000-\u001f\u007f-\u009f\u00ad\u061c\u200b-\u200f\u2028\u2029\ufeff]/g,
                            function(e, t, r) {
                                (e.state.specialChars = new RegExp(
                                    t.source + (t.test("\t") ? "" : "|\t"),
                                    "g"
                                )),
                                r != ga && e.refresh();
                            }
                        ),
                        r(
                            "specialCharPlaceholder",
                            Zt,
                            function(e) {
                                return e.refresh();
                            }, !0
                        ),
                        r("electricChars", !0),
                        r(
                            "inputStyle",
                            v ? "contenteditable" : "textarea",
                            function() {
                                throw new Error(
                                    "inputStyle can not (yet) be changed in a running editor"
                                );
                            }, !0
                        ),
                        r(
                            "spellcheck", !1,
                            function(e, t) {
                                return (e.getInputField().spellcheck = t);
                            }, !0
                        ),
                        r("rtlMoveVisually", !w),
                        r("wholeLineUpdateBefore", !0),
                        r(
                            "theme",
                            "default",
                            function(e) {
                                ma(e), ba(e);
                            }, !0
                        ),
                        r("keyMap", "default", function(e, t, r) {
                            var n = qo(t),
                                i = r != ga && qo(r);
                            i && i.detach && i.detach(e, n), n.attach && n.attach(e, i || null);
                        }),
                        r("extraKeys", null),
                        r("configureMouse", null),
                        r("lineWrapping", !1, xa, !0),
                        r(
                            "gutters", [],
                            function(e) {
                                ui(e.options), ba(e);
                            }, !0
                        ),
                        r(
                            "fixedGutter", !0,
                            function(e, t) {
                                (e.display.gutters.style.left = t ? rn(e.display) + "px" : "0"),
                                e.refresh();
                            }, !0
                        ),
                        r(
                            "coverGutterNextToScrollbar", !1,
                            function(e) {
                                return Hn(e);
                            }, !0
                        ),
                        r(
                            "scrollbarStyle",
                            "native",
                            function(e) {
                                jn(e),
                                    Hn(e),
                                    e.display.scrollbars.setScrollTop(e.doc.scrollTop),
                                    e.display.scrollbars.setScrollLeft(e.doc.scrollLeft);
                            }, !0
                        ),
                        r(
                            "lineNumbers", !1,
                            function(e) {
                                ui(e.options), ba(e);
                            }, !0
                        ),
                        r("firstLineNumber", 1, ba, !0),
                        r(
                            "lineNumberFormatter",
                            function(e) {
                                return e;
                            },
                            ba, !0
                        ),
                        r("showCursorWhenSelecting", !1, sn, !0),
                        r("resetSelectionOnContextMenu", !0),
                        r("lineWiseCopyCut", !0),
                        r("pasteLinesPerSelection", !0),
                        r("readOnly", !1, function(e, t) {
                            "nocursor" == t && (vn(e), e.display.input.blur()),
                                e.display.input.readOnlyChanged(t);
                        }),
                        r(
                            "disableInput", !1,
                            function(e, t) {
                                t || e.display.input.reset();
                            }, !0
                        ),
                        r("dragDrop", !0, wa),
                        r("allowDropFileTypes", null),
                        r("cursorBlinkRate", 530),
                        r("cursorScrollMargin", 0),
                        r("cursorHeight", 1, sn, !0),
                        r("singleCursorHeightPerLine", !0, sn, !0),
                        r("workTime", 100),
                        r("workDelay", 100),
                        r("flattenSpans", !0, Li, !0),
                        r("addModeClass", !1, Li, !0),
                        r("pollInterval", 100),
                        r("undoDepth", 200, function(e, t) {
                            return (e.doc.history.undoDepth = t);
                        }),
                        r("historyEventDelay", 1250),
                        r(
                            "viewportMargin",
                            10,
                            function(e) {
                                return e.refresh();
                            }, !0
                        ),
                        r("maxHighlightLength", 1e4, Li, !0),
                        r("moveInputWithCursor", !0, function(e, t) {
                            t || e.display.input.resetPosition();
                        }),
                        r("tabindex", null, function(e, t) {
                            return (e.display.input.getField().tabIndex = t || "");
                        }),
                        r("autofocus", null),
                        r(
                            "direction",
                            "ltr",
                            function(e, t) {
                                return e.doc.setDirection(t);
                            }, !0
                        );
                })(ka),
                (function(e) {
                    var t = e.optionHandlers,
                        r = (e.helpers = {});
                    (e.prototype = {
                        constructor: e,
                        focus: function() {
                            window.focus(), this.display.input.focus();
                        },
                        setOption: function(e, r) {
                            var n = this.options,
                                i = n[e];
                            (n[e] == r && "mode" != e) ||
                            ((n[e] = r),
                                t.hasOwnProperty(e) && Kn(this, t[e])(this, r, i),
                                rt(this, "optionChange", this, e));
                        },
                        getOption: function(e) {
                            return this.options[e];
                        },
                        getDoc: function() {
                            return this.doc;
                        },
                        addKeyMap: function(e, t) {
                            this.state.keyMaps[t ? "push" : "unshift"](qo(e));
                        },
                        removeKeyMap: function(e) {
                            for (var t = this.state.keyMaps, r = 0; r < t.length; ++r)
                                if (t[r] == e || t[r].name == e) return t.splice(r, 1), !0;
                        },
                        addOverlay: Gn(function(t, r) {
                            var n = t.token ? t : e.getMode(this.options, t);
                            if (n.startState) throw new Error("Overlays may not be stateful.");
                            !(function(e, t, r) {
                                for (var n = 0, i = r(t); n < e.length && r(e[n]) <= i;) n++;
                                e.splice(n, 0, t);
                            })(
                                this.state.overlays, {
                                    mode: n,
                                    modeSpec: t,
                                    opaque: r && r.opaque,
                                    priority: (r && r.priority) || 0,
                                },
                                function(e) {
                                    return e.priority;
                                }
                            ),
                            this.state.modeGen++,
                                Yn(this);
                        }),
                        removeOverlay: Gn(function(e) {
                            for (var t = this.state.overlays, r = 0; r < t.length; ++r) {
                                var n = t[r].modeSpec;
                                if (n == e || ("string" == typeof e && n.name == e))
                                    return t.splice(r, 1), this.state.modeGen++, void Yn(this);
                            }
                        }),
                        indentLine: Gn(function(e, t, r) {
                            "string" != typeof t &&
                                "number" != typeof t &&
                                (t =
                                    null == t ?
                                    this.options.smartIndent ?
                                    "smart" :
                                    "prev" :
                                    t ?
                                    "add" :
                                    "subtract"),
                                he(this.doc, e) && Sa(this, e, t, r);
                        }),
                        indentSelection: Gn(function(e) {
                            for (var t = this.doc.sel.ranges, r = -1, n = 0; n < t.length; n++) {
                                var i = t[n];
                                if (i.empty())
                                    i.head.line > r &&
                                    (Sa(this, i.head.line, e, !0),
                                        (r = i.head.line),
                                        n == this.doc.sel.primIndex && Ln(this));
                                else {
                                    var o = i.from(),
                                        a = i.to(),
                                        l = Math.max(r, o.line);
                                    r = Math.min(this.lastLine(), a.line - (a.ch ? 0 : 1)) + 1;
                                    for (var s = l; s < r; ++s) Sa(this, s, e);
                                    var c = this.doc.sel.ranges;
                                    0 == o.ch &&
                                        t.length == c.length &&
                                        c[n].from().ch > 0 &&
                                        qi(this.doc, n, new vi(o, c[n].to()), $);
                                }
                            }
                        }),
                        getTokenAt: function(e, t) {
                            return Bt(this, e, t);
                        },
                        getLineTokens: function(e, t) {
                            return Bt(this, me(e), t, !0);
                        },
                        getTokenTypeAt: function(e) {
                            e = ke(this.doc, e);
                            var t,
                                r = Dt(this, le(this.doc, e.line)),
                                n = 0,
                                i = (r.length - 1) / 2,
                                o = e.ch;
                            if (0 == o) t = r[2];
                            else
                                for (;;) {
                                    var a = (n + i) >> 1;
                                    if ((a ? r[2 * a - 1] : 0) >= o) i = a;
                                    else {
                                        if (!(r[2 * a + 1] < o)) {
                                            t = r[2 * a + 2];
                                            break;
                                        }
                                        n = a + 1;
                                    }
                                }
                            var l = t ? t.indexOf("overlay ") : -1;
                            return l < 0 ? t : 0 == l ? null : t.slice(0, l - 1);
                        },
                        getModeAt: function(t) {
                            var r = this.doc.mode;
                            return r.innerMode ? e.innerMode(r, this.getTokenAt(t).state).mode : r;
                        },
                        getHelper: function(e, t) {
                            return this.getHelpers(e, t)[0];
                        },
                        getHelpers: function(e, t) {
                            var n = [];
                            if (!r.hasOwnProperty(t)) return n;
                            var i = r[t],
                                o = this.getModeAt(e);
                            if ("string" == typeof o[t]) i[o[t]] && n.push(i[o[t]]);
                            else if (o[t])
                                for (var a = 0; a < o[t].length; a++) {
                                    var l = i[o[t][a]];
                                    l && n.push(l);
                                }
                            else
                                o.helperType && i[o.helperType] ?
                                n.push(i[o.helperType]) :
                                i[o.name] && n.push(i[o.name]);
                            for (var s = 0; s < i._global.length; s++) {
                                var c = i._global[s];
                                c.pred(o, this) && -1 == R(n, c.val) && n.push(c.val);
                            }
                            return n;
                        },
                        getStateAfter: function(e, t) {
                            var r = this.doc;
                            return It(this, (e = xe(r, null == e ? r.first + r.size - 1 : e)) + 1, t)
                                .state;
                        },
                        cursorCoords: function(e, t) {
                            var r = this.doc.sel.primary();
                            return Ur(
                                this,
                                null == e ?
                                r.head :
                                "object" == typeof e ?
                                ke(this.doc, e) :
                                e ?
                                r.from() :
                                r.to(),
                                t || "page"
                            );
                        },
                        charCoords: function(e, t) {
                            return qr(this, ke(this.doc, e), t || "page");
                        },
                        coordsChar: function(e, t) {
                            return Gr(this, (e = $r(this, e, t || "page")).left, e.top);
                        },
                        lineAtHeight: function(e, t) {
                            return (
                                (e = $r(this, { top: e, left: 0 }, t || "page").top),
                                fe(this.doc, e + this.display.viewOffset)
                            );
                        },
                        heightAtLine: function(e, t, r) {
                            var n,
                                i = !1;
                            if ("number" == typeof e) {
                                var o = this.doc.first + this.doc.size - 1;
                                e < this.doc.first ? (e = this.doc.first) : e > o && ((e = o), (i = !0)),
                                    (n = le(this.doc, e));
                            } else n = e;
                            return (
                                Br(this, n, { top: 0, left: 0 }, t || "page", r || i).top +
                                (i ? this.doc.height - Ue(n) : 0)
                            );
                        },
                        defaultTextHeight: function() {
                            return Jr(this.display);
                        },
                        defaultCharWidth: function() {
                            return en(this.display);
                        },
                        getViewport: function() {
                            return { from: this.display.viewFrom, to: this.display.viewTo };
                        },
                        addWidget: function(e, t, r, n, i) {
                            var o,
                                a,
                                l,
                                s = this.display,
                                c = (e = Ur(this, ke(this.doc, e))).bottom,
                                u = e.left;
                            if (
                                ((t.style.position = "absolute"),
                                    t.setAttribute("cm-ignore-events", "true"),
                                    this.display.input.setUneditable(t),
                                    s.sizer.appendChild(t),
                                    "over" == n)
                            )
                                c = e.top;
                            else if ("above" == n || "near" == n) {
                                var d = Math.max(s.wrapper.clientHeight, this.doc.height),
                                    f = Math.max(s.sizer.clientWidth, s.lineSpace.clientWidth);
                                ("above" == n || e.bottom + t.offsetHeight > d) && e.top > t.offsetHeight ?
                                    (c = e.top - t.offsetHeight) :
                                    e.bottom + t.offsetHeight <= d && (c = e.bottom),
                                    u + t.offsetWidth > f && (u = f - t.offsetWidth);
                            }
                            (t.style.top = c + "px"),
                            (t.style.left = t.style.right = ""),
                            "right" == i
                                ?
                                ((u = s.sizer.clientWidth - t.offsetWidth), (t.style.right = "0px")) :
                                ("left" == i ?
                                    (u = 0) :
                                    "middle" == i &&
                                    (u = (s.sizer.clientWidth - t.offsetWidth) / 2),
                                    (t.style.left = u + "px")),
                                r &&
                                ((o = this),
                                    (a = {
                                        left: u,
                                        top: c,
                                        right: u + t.offsetWidth,
                                        bottom: c + t.offsetHeight,
                                    }),
                                    null != (l = Cn(o, a)).scrollTop && An(o, l.scrollTop),
                                    null != l.scrollLeft && Nn(o, l.scrollLeft));
                        },
                        triggerOnKeyDown: Gn(ia),
                        triggerOnKeyPress: Gn(aa),
                        triggerOnKeyUp: oa,
                        triggerOnMouseDown: Gn(ua),
                        execCommand: function(e) {
                            if (Xo.hasOwnProperty(e)) return Xo[e].call(null, this);
                        },
                        triggerElectric: Gn(function(e) {
                            Aa(this, e);
                        }),
                        findPosH: function(e, t, r, n) {
                            var i = 1;
                            t < 0 && ((i = -1), (t = -t));
                            for (
                                var o = ke(this.doc, e), a = 0; a < t && !(o = Wa(this.doc, o, i, r, n)).hitSide;
                                ++a
                            );
                            return o;
                        },
                        moveH: Gn(function(e, t) {
                            var r = this;
                            this.extendSelectionsBy(function(n) {
                                return r.display.shift || r.doc.extend || n.empty() ?
                                    Wa(r.doc, n.head, e, t, r.options.rtlMoveVisually) :
                                    e < 0 ?
                                    n.from() :
                                    n.to();
                            }, U);
                        }),
                        deleteH: Gn(function(e, t) {
                            var r = this.doc.sel,
                                n = this.doc;
                            r.somethingSelected() ?
                                n.replaceSelection("", null, "+delete") :
                                Uo(this, function(r) {
                                    var i = Wa(n, r.head, e, t, !1);
                                    return e < 0 ? { from: i, to: r.head } : { from: r.head, to: i };
                                });
                        }),
                        findPosV: function(e, t, r, n) {
                            var i = 1,
                                o = n;
                            t < 0 && ((i = -1), (t = -t));
                            for (var a = ke(this.doc, e), l = 0; l < t; ++l) {
                                var s = Ur(this, a, "div");
                                if (
                                    (null == o ? (o = s.left) : (s.left = o),
                                        (a = Pa(this, s, i, r)).hitSide)
                                )
                                    break;
                            }
                            return a;
                        },
                        moveV: Gn(function(e, t) {
                            var r = this,
                                n = this.doc,
                                i = [],
                                o = !this.display.shift && !n.extend && n.sel.somethingSelected();
                            if (
                                (n.extendSelectionsBy(function(a) {
                                        if (o) return e < 0 ? a.from() : a.to();
                                        var l = Ur(r, a.head, "div");
                                        null != a.goalColumn && (l.left = a.goalColumn), i.push(l.left);
                                        var s = Pa(r, l, e, t);
                                        return (
                                            "page" == t &&
                                            a == n.sel.primary() &&
                                            Sn(r, qr(r, s, "div").top - l.top),
                                            s
                                        );
                                    }, U),
                                    i.length)
                            )
                                for (var a = 0; a < n.sel.ranges.length; a++)
                                    n.sel.ranges[a].goalColumn = i[a];
                        }),
                        findWordAt: function(e) {
                            var t = le(this.doc, e.line).text,
                                r = e.ch,
                                n = e.ch;
                            if (t) {
                                var i = this.getHelper(e, "wordChars");
                                ("before" != e.sticky && n != t.length) || !r ? ++n : --r;
                                for (
                                    var o = t.charAt(r),
                                        a = te(o, i) ?

                                        function(e) {
                                            return te(e, i);
                                        } :
                                        /\s/.test(o) ?

                                        function(e) {
                                            return /\s/.test(e);
                                        } :
                                        function(e) {
                                            return !/\s/.test(e) && !te(e);
                                        }; r > 0 && a(t.charAt(r - 1));

                                )
                                    --r;
                                for (; n < t.length && a(t.charAt(n));) ++n;
                            }
                            return new vi(me(e.line, r), me(e.line, n));
                        },
                        toggleOverwrite: function(e) {
                            (null != e && e == this.state.overwrite) ||
                            ((this.state.overwrite = !this.state.overwrite) ?
                                W(this.display.cursorDiv, "CodeMirror-overwrite") :
                                M(this.display.cursorDiv, "CodeMirror-overwrite"),
                                rt(this, "overwriteToggle", this, this.state.overwrite));
                        },
                        hasFocus: function() {
                            return this.display.input.getField() == E();
                        },
                        isReadOnly: function() {
                            return !(!this.options.readOnly && !this.doc.cantEdit);
                        },
                        scrollTo: Gn(function(e, t) {
                            Mn(this, e, t);
                        }),
                        getScrollInfo: function() {
                            var e = this.display.scroller;
                            return {
                                left: e.scrollLeft,
                                top: e.scrollTop,
                                height: e.scrollHeight - Sr(this) - this.display.barHeight,
                                width: e.scrollWidth - Sr(this) - this.display.barWidth,
                                clientHeight: Mr(this),
                                clientWidth: Lr(this),
                            };
                        },
                        scrollIntoView: Gn(function(e, t) {
                            null == e ?
                                ((e = { from: this.doc.sel.primary().head, to: null }),
                                    null == t && (t = this.options.cursorScrollMargin)) :
                                "number" == typeof e ?
                                (e = { from: me(e, 0), to: null }) :
                                null == e.from && (e = { from: e, to: null }),
                                e.to || (e.to = e.from),
                                (e.margin = t || 0),
                                null != e.from.line ?
                                (function(e, t) {
                                    Tn(e), (e.curOp.scrollToPos = t);
                                })(this, e) :
                                On(this, e.from, e.to, e.margin);
                        }),
                        setSize: Gn(function(e, t) {
                            var r = this,
                                n = function(e) {
                                    return "number" == typeof e || /^\d+$/.test(String(e)) ? e + "px" : e;
                                };
                            null != e && (this.display.wrapper.style.width = n(e)),
                                null != t && (this.display.wrapper.style.height = n(t)),
                                this.options.lineWrapping && Ir(this);
                            var i = this.display.viewFrom;
                            this.doc.iter(i, this.display.viewTo, function(e) {
                                    if (e.widgets)
                                        for (var t = 0; t < e.widgets.length; t++)
                                            if (e.widgets[t].noHScroll) {
                                                Zn(r, i, "widget");
                                                break;
                                            }
                                            ++i;
                                }),
                                (this.curOp.forceUpdate = !0),
                                rt(this, "refresh", this);
                        }),
                        operation: function(e) {
                            return Vn(this, e);
                        },
                        startOperation: function() {
                            return Rn(this);
                        },
                        endOperation: function() {
                            return _n(this);
                        },
                        refresh: Gn(function() {
                            var e = this.display.cachedTextHeight;
                            Yn(this),
                                (this.curOp.forceUpdate = !0),
                                jr(this),
                                Mn(this, this.doc.scrollLeft, this.doc.scrollTop),
                                li(this),
                                (null == e || Math.abs(e - Jr(this.display)) > 0.5) && on(this),
                                rt(this, "refresh", this);
                        }),
                        swapDoc: Gn(function(e) {
                            var t = this.doc;
                            return (
                                (t.cm = null),
                                Ai(this, e),
                                jr(this),
                                this.display.input.reset(),
                                Mn(this, e.scrollLeft, e.scrollTop),
                                (this.curOp.forceScroll = !0),
                                ar(this, "swapDoc", this, t),
                                t
                            );
                        }),
                        getInputField: function() {
                            return this.display.input.getField();
                        },
                        getWrapperElement: function() {
                            return this.display.wrapper;
                        },
                        getScrollerElement: function() {
                            return this.display.scroller;
                        },
                        getGutterElement: function() {
                            return this.display.gutters;
                        },
                    }),
                    at(e),
                        (e.registerHelper = function(t, n, i) {
                            r.hasOwnProperty(t) || (r[t] = e[t] = { _global: [] }), (r[t][n] = i);
                        }),
                        (e.registerGlobalHelper = function(t, n, i, o) {
                            e.registerHelper(t, n, o), r[t]._global.push({ pred: i, val: o });
                        });
                })(ka);
                var _a,
                    Ba = "iter insert remove copy getEditor constructor".split(" ");
                for (var $a in Lo.prototype)
                    Lo.prototype.hasOwnProperty($a) &&
                    R(Ba, $a) < 0 &&
                    (ka.prototype[$a] = (function(e) {
                        return function() {
                            return e.apply(this.doc, arguments);
                        };
                    })(Lo.prototype[$a]));
                return (
                    at(Lo),
                    (ka.inputStyles = { textarea: Ra, contenteditable: Ha }),
                    (ka.defineMode = function(e) {
                        ka.defaults.mode || "null" == e || (ka.defaults.mode = e),
                            function(e, t) {
                                arguments.length > 2 &&
                                    (t.dependencies = Array.prototype.slice.call(arguments, 2)),
                                    (Ct[e] = t);
                            }.apply(this, arguments);
                    }),
                    (ka.defineMIME = function(e, t) {
                        St[e] = t;
                    }),
                    ka.defineMode("null", function() {
                        return {
                            token: function(e) {
                                return e.skipToEnd();
                            },
                        };
                    }),
                    ka.defineMIME("text/plain", "null"),
                    (ka.defineExtension = function(e, t) {
                        ka.prototype[e] = t;
                    }),
                    (ka.defineDocExtension = function(e, t) {
                        Lo.prototype[e] = t;
                    }),
                    (ka.fromTextArea = function(e, t) {
                        if (
                            (((t = t ? I(t) : {}).value = e.value), !t.tabindex && e.tabIndex && (t.tabindex = e.tabIndex), !t.placeholder && e.placeholder && (t.placeholder = e.placeholder),
                                null == t.autofocus)
                        ) {
                            var r = E();
                            t.autofocus =
                                r == e || (null != e.getAttribute("autofocus") && r == document.body);
                        }

                        function n() {
                            e.value = l.getValue();
                        }
                        var i;
                        if (e.form && (Je(e.form, "submit", n), !t.leaveSubmitMethodAlone)) {
                            var o = e.form;
                            i = o.submit;
                            try {
                                var a = (o.submit = function() {
                                    n(), (o.submit = i), o.submit(), (o.submit = a);
                                });
                            } catch (e) {}
                        }
                        (t.finishInit = function(t) {
                            (t.save = n),
                            (t.getTextArea = function() {
                                return e;
                            }),
                            (t.toTextArea = function() {
                                (t.toTextArea = isNaN),
                                n(),
                                    e.parentNode.removeChild(t.getWrapperElement()),
                                    (e.style.display = ""),
                                    e.form &&
                                    (tt(e.form, "submit", n),
                                        "function" == typeof e.form.submit && (e.form.submit = i));
                            });
                        }),
                        (e.style.display = "none");
                        var l = ka(function(t) {
                            return e.parentNode.insertBefore(t, e.nextSibling);
                        }, t);
                        return l;
                    }),
                    ((_a = ka).off = tt),
                    (_a.on = Je),
                    (_a.wheelEventPixels = pi),
                    (_a.Doc = Lo),
                    (_a.splitLines = bt),
                    (_a.countColumn = j),
                    (_a.findColumn = V),
                    (_a.isWordChar = ee),
                    (_a.Pass = B),
                    (_a.signal = rt),
                    (_a.Line = Ut),
                    (_a.changeEnd = wi),
                    (_a.scrollbarModel = In),
                    (_a.Pos = me),
                    (_a.cmpPos = ge),
                    (_a.modes = Ct),
                    (_a.mimeModes = St),
                    (_a.resolveMode = Lt),
                    (_a.getMode = Mt),
                    (_a.modeExtensions = Tt),
                    (_a.extendMode = Ot),
                    (_a.copyState = At),
                    (_a.startState = Nt),
                    (_a.innerMode = zt),
                    (_a.commands = Xo),
                    (_a.keyMap = Io),
                    (_a.keyName = $o),
                    (_a.isModifierKey = _o),
                    (_a.lookupKey = Ro),
                    (_a.normalizeKeyMap = Fo),
                    (_a.StringStream = Et),
                    (_a.SharedTextMarker = xo),
                    (_a.TextMarker = bo),
                    (_a.LineWidget = go),
                    (_a.e_preventDefault = lt),
                    (_a.e_stopPropagation = st),
                    (_a.e_stop = ut),
                    (_a.addClass = W),
                    (_a.contains = N),
                    (_a.rmClass = M),
                    (_a.keyNames = Wo),
                    (ka.version = "5.34.0"),
                    ka
                );
            }),
            (e.exports = n());
        },
        function(e, t, r) {
            "use strict";
            Object.defineProperty(t, "__esModule", { value: !0 });
            var n = window.location,
                i = n.hash,
                o = n.search,
                a = n.protocol,
                l = n.host,
                s = n.hostname,
                c = n.origin,
                u = n.port,
                d = n.pathname,
                f = n.href;
            (t.hash = i),
            (t.search = o),
            (t.protocol = a),
            (t.host = l),
            (t.hostname = s),
            (t.origin = c),
            (t.port = u),
            (t.pathname = d),
            (t.href = f);
            var h = (t.setURL = function(e, t) {
                window.location[e] = t;
            });
            (t.setHash = function(e) {
                h("hash", e);
            }),
            (t.setHref = function(e) {
                h("href", e);
            });
        },
        function(e, t, r) {
            "use strict";
            Object.defineProperty(t, "__esModule", { value: !0 });
            var n = r(16);
            Object.defineProperty(t, "dyslexic", {
                enumerable: !0,
                get: function() {
                    return ((e = n), e && e.__esModule ? e : { default: e }).default;
                    var e;
                },
            });
            t.defaultFont = { name: "default", key: "", className: "" };
        },
        function(e, t, r) {
            "use strict";
            Object.defineProperty(t, "__esModule", { value: !0 }), (t.fullMode = t.simpleMode = void 0);
            var n = r(6);
            Object.keys(n).forEach(function(e) {
                "default" !== e &&
                    "__esModule" !== e &&
                    Object.defineProperty(t, e, {
                        enumerable: !0,
                        get: function() {
                            return n[e];
                        },
                    });
            });
            var i = r(91);
            Object.defineProperty(t, "simpleMode", {
                enumerable: !0,
                get: function() {
                    return a(i).default;
                },
            });
            var o = r(92);

            function a(e) {
                return e && e.__esModule ? e : { default: e };
            }
            Object.defineProperty(t, "fullMode", {
                    enumerable: !0,
                    get: function() {
                        return a(o).default;
                    },
                }),
                r(93);
        },
        function(e, t, r) {
            "use strict";
            Object.defineProperty(t, "__esModule", { value: !0 }),
                (t.simpleHighligtherClasses = t.colorschemes = void 0);
            var n,
                i = r(2),
                o = (n = i) && n.__esModule ? n : { default: n };
            r(34),
                r(7),
                r(35),
                r(8),
                r(36),
                r(9),
                r(37),
                r(38),
                r(39),
                r(40),
                r(41),
                r(42),
                r(43),
                r(44),
                r(45),
                r(46),
                r(47),
                r(48),
                r(49),
                r(50),
                r(51),
                r(52),
                r(53),
                r(54),
                r(55),
                r(56),
                r(57),
                r(58),
                r(59),
                r(60),
                r(61),
                r(62),
                r(63),
                r(64),
                r(65),
                r(66),
                r(67),
                r(68),
                r(69),
                r(70),
                r(71),
                r(72),
                r(73),
                r(74),
                r(75),
                r(76),
                r(77),
                r(78),
                r(79),
                r(80),
                r(81),
                r(82),
                r(83),
                r(84),
                r(85),
                r(86),
                r(87),
                r(88),
                r(89),
                r(90);
            (t.colorschemes = [
                "3024-day",
                "3024-night",
                "abcdef",
                "ambiance-mobile",
                "ambiance",
                "base16-dark",
                "base16-light",
                "bespin",
                "blackboard",
                "cobalt",
                "colorforth",
                "dracula",
                "duotone-dark",
                "duotone-light",
                "eclipse",
                "elegant",
                "erlang-dark",
                "hopscotch",
                "icecoder",
                "isotope",
                "lesser-dark",
                "liquibyte",
                "material",
                "mbo",
                "mdn-like",
                "midnight",
                "monokai",
                "neat",
                "neo",
                "night",
                "oceanic-next",
                "panda-syntax",
                "paraiso-dark",
                "paraiso-light",
                "pastel-on-dark",
                "railscasts",
                "rubyblue",
                "seti",
                "shadowfox",
                "solarized",
                "the-matrix",
                "tomorrow-night-bright",
                "tomorrow-night-eighties",
                "ttcn",
                "twilight",
                "vibrant-ink",
                "xq-dark",
                "xq-light",
                "yeti",
                "zenburn",
            ]),
            (t.simpleHighligtherClasses = function(e) {
                return "CodeMirror CodeMirror-simple cm-s-" + e;
            });
            t.default = o.default;
        },
        function(e, t, r) {
            (function(e) {
                "use strict";
                var t = {
                        autoSelfClosers: {
                            area: !0,
                            base: !0,
                            br: !0,
                            col: !0,
                            command: !0,
                            embed: !0,
                            frame: !0,
                            hr: !0,
                            img: !0,
                            input: !0,
                            keygen: !0,
                            link: !0,
                            meta: !0,
                            param: !0,
                            source: !0,
                            track: !0,
                            wbr: !0,
                            menuitem: !0,
                        },
                        implicitlyClosed: {
                            dd: !0,
                            li: !0,
                            optgroup: !0,
                            option: !0,
                            p: !0,
                            rp: !0,
                            rt: !0,
                            tbody: !0,
                            td: !0,
                            tfoot: !0,
                            th: !0,
                            tr: !0,
                        },
                        contextGrabbers: {
                            dd: { dd: !0, dt: !0 },
                            dt: { dd: !0, dt: !0 },
                            li: { li: !0 },
                            option: { option: !0, optgroup: !0 },
                            optgroup: { optgroup: !0 },
                            p: {
                                address: !0,
                                article: !0,
                                aside: !0,
                                blockquote: !0,
                                dir: !0,
                                div: !0,
                                dl: !0,
                                fieldset: !0,
                                footer: !0,
                                form: !0,
                                h1: !0,
                                h2: !0,
                                h3: !0,
                                h4: !0,
                                h5: !0,
                                h6: !0,
                                header: !0,
                                hgroup: !0,
                                hr: !0,
                                menu: !0,
                                nav: !0,
                                ol: !0,
                                p: !0,
                                pre: !0,
                                section: !0,
                                table: !0,
                                ul: !0,
                            },
                            rp: { rp: !0, rt: !0 },
                            rt: { rp: !0, rt: !0 },
                            tbody: { tbody: !0, tfoot: !0 },
                            td: { td: !0, th: !0 },
                            tfoot: { tbody: !0 },
                            th: { td: !0, th: !0 },
                            thead: { tbody: !0, tfoot: !0 },
                            tr: { tr: !0 },
                        },
                        doNotIndent: { pre: !0 },
                        allowUnquoted: !0,
                        allowMissing: !0,
                        caseFold: !0,
                    },
                    r = {
                        autoSelfClosers: {},
                        implicitlyClosed: {},
                        contextGrabbers: {},
                        doNotIndent: {},
                        allowUnquoted: !1,
                        allowMissing: !1,
                        allowMissingTagName: !1,
                        caseFold: !1,
                    };
                e.defineMode("xml", function(n, i) {
                        var o,
                            a,
                            l = n.indentUnit,
                            s = {},
                            c = i.htmlMode ? t : r;
                        for (var u in c) s[u] = c[u];
                        for (var u in i) s[u] = i[u];

                        function d(e, t) {
                            function r(r) {
                                return (t.tokenize = r), r(e, t);
                            }
                            var n = e.next();
                            return "<" == n ?
                                e.eat("!") ?
                                e.eat("[") ?
                                e.match("CDATA[") ?
                                r(h("atom", "]]>")) :
                                null :
                                e.match("--") ?
                                r(h("comment", "--\x3e")) :
                                e.match("DOCTYPE", !0, !0) ?
                                (e.eatWhile(/[\w\._\-]/),
                                    r(
                                        (function e(t) {
                                            return function(r, n) {
                                                for (var i; null != (i = r.next());) {
                                                    if ("<" == i)
                                                        return (n.tokenize = e(t + 1)), n.tokenize(r, n);
                                                    if (">" == i) {
                                                        if (1 == t) {
                                                            n.tokenize = d;
                                                            break;
                                                        }
                                                        return (n.tokenize = e(t - 1)), n.tokenize(r, n);
                                                    }
                                                }
                                                return "meta";
                                            };
                                        })(1)
                                    )) :
                                null :
                                e.eat("?") ?
                                (e.eatWhile(/[\w\._\-]/), (t.tokenize = h("meta", "?>")), "meta") :
                                ((o = e.eat("/") ? "closeTag" : "openTag"), (t.tokenize = f), "tag bracket") :
                                "&" == n ?
                                (
                                    e.eat("#") ?
                                    e.eat("x") ?
                                    e.eatWhile(/[a-fA-F\d]/) && e.eat(";") :
                                    e.eatWhile(/[\d]/) && e.eat(";") :
                                    e.eatWhile(/[\w\.\-:]/) && e.eat(";")
                                ) ?
                                "atom" :
                                "error" :
                                (e.eatWhile(/[^&<]/), null);
                        }

                        function f(e, t) {
                            var r,
                                n,
                                i = e.next();
                            if (">" == i || ("/" == i && e.eat(">")))
                                return (
                                    (t.tokenize = d), (o = ">" == i ? "endTag" : "selfcloseTag"), "tag bracket"
                                );
                            if ("=" == i) return (o = "equals"), null;
                            if ("<" == i) {
                                (t.tokenize = d), (t.state = g), (t.tagName = t.tagStart = null);
                                var a = t.tokenize(e, t);
                                return a ? a + " tag error" : "tag error";
                            }
                            return /[\'\"]/.test(i) ?
                                ((t.tokenize =
                                        ((r = i),
                                            ((n = function(e, t) {
                                                for (; !e.eol();)
                                                    if (e.next() == r) {
                                                        t.tokenize = f;
                                                        break;
                                                    }
                                                return "string";
                                            }).isInAttribute = !0),
                                            n)),
                                    (t.stringStartCol = e.column()),
                                    t.tokenize(e, t)) :
                                (e.match(/^[^\s\u00a0=<>\"\']*[^\s\u00a0=<>\"\'\/]/), "word");
                        }

                        function h(e, t) {
                            return function(r, n) {
                                for (; !r.eol();) {
                                    if (r.match(t)) {
                                        n.tokenize = d;
                                        break;
                                    }
                                    r.next();
                                }
                                return e;
                            };
                        }

                        function p(e) {
                            e.context && (e.context = e.context.prev);
                        }

                        function m(e, t) {
                            for (var r;;) {
                                if (!e.context) return;
                                if (
                                    ((r = e.context.tagName), !s.contextGrabbers.hasOwnProperty(r) ||
                                        !s.contextGrabbers[r].hasOwnProperty(t))
                                )
                                    return;
                                p(e);
                            }
                        }

                        function g(e, t, r) {
                            return "openTag" == e ? ((r.tagStart = t.column()), v) : "closeTag" == e ? y : g;
                        }

                        function v(e, t, r) {
                            return "word" == e ?
                                ((r.tagName = t.current()), (a = "tag"), x) :
                                s.allowMissingTagName && "endTag" == e ?
                                ((a = "tag bracket"), x(e, t, r)) :
                                ((a = "error"), v);
                        }

                        function y(e, t, r) {
                            if ("word" == e) {
                                var n = t.current();
                                return (
                                    r.context &&
                                    r.context.tagName != n &&
                                    s.implicitlyClosed.hasOwnProperty(r.context.tagName) &&
                                    p(r),
                                    (r.context && r.context.tagName == n) || !1 === s.matchClosing ?
                                    ((a = "tag"), b) :
                                    ((a = "tag error"), w)
                                );
                            }
                            return s.allowMissingTagName && "endTag" == e ?
                                ((a = "tag bracket"), b(e, t, r)) :
                                ((a = "error"), w);
                        }

                        function b(e, t, r) {
                            return "endTag" != e ? ((a = "error"), b) : (p(r), g);
                        }

                        function w(e, t, r) {
                            return (a = "error"), b(e, 0, r);
                        }

                        function x(e, t, r) {
                            if ("word" == e) return (a = "attribute"), k;
                            if ("endTag" == e || "selfcloseTag" == e) {
                                var n = r.tagName,
                                    i = r.tagStart;
                                return (
                                    (r.tagName = r.tagStart = null),
                                    "selfcloseTag" == e || s.autoSelfClosers.hasOwnProperty(n) ?
                                    m(r, n) :
                                    (m(r, n),
                                        (r.context = new(function(e, t, r) {
                                            (this.prev = e.context),
                                            (this.tagName = t),
                                            (this.indent = e.indented),
                                            (this.startOfLine = r),
                                            (s.doNotIndent.hasOwnProperty(t) ||
                                                (e.context && e.context.noIndent)) &&
                                            (this.noIndent = !0);
                                        })(r, n, i == r.indented))),
                                    g
                                );
                            }
                            return (a = "error"), x;
                        }

                        function k(e, t, r) {
                            return "equals" == e ? C : (s.allowMissing || (a = "error"), x(e, 0, r));
                        }

                        function C(e, t, r) {
                            return "string" == e ?
                                S :
                                "word" == e && s.allowUnquoted ?
                                ((a = "string"), x) :
                                ((a = "error"), x(e, 0, r));
                        }

                        function S(e, t, r) {
                            return "string" == e ? S : x(e, 0, r);
                        }
                        return (
                            (d.isInText = !0), {
                                startState: function(e) {
                                    var t = {
                                        tokenize: d,
                                        state: g,
                                        indented: e || 0,
                                        tagName: null,
                                        tagStart: null,
                                        context: null,
                                    };
                                    return null != e && (t.baseIndent = e), t;
                                },
                                token: function(e, t) {
                                    if ((!t.tagName && e.sol() && (t.indented = e.indentation()), e.eatSpace()))
                                        return null;
                                    o = null;
                                    var r = t.tokenize(e, t);
                                    return (
                                        (r || o) &&
                                        "comment" != r &&
                                        ((a = null),
                                            (t.state = t.state(o || r, e, t)),
                                            a && (r = "error" == a ? r + " error" : a)),
                                        r
                                    );
                                },
                                indent: function(t, r, n) {
                                    var i = t.context;
                                    if (t.tokenize.isInAttribute)
                                        return t.tagStart == t.indented ? t.stringStartCol + 1 : t.indented + l;
                                    if (i && i.noIndent) return e.Pass;
                                    if (t.tokenize != f && t.tokenize != d)
                                        return n ? n.match(/^(\s*)/)[0].length : 0;
                                    if (t.tagName)
                                        return !1 !== s.multilineTagIndentPastTag ?
                                            t.tagStart + t.tagName.length + 2 :
                                            t.tagStart + l * (s.multilineTagIndentFactor || 1);
                                    if (s.alignCDATA && /<!\[CDATA\[/.test(r)) return 0;
                                    var o = r && /^<(\/)?([\w_:\.-]*)/.exec(r);
                                    if (o && o[1])
                                        for (; i;) {
                                            if (i.tagName == o[2]) {
                                                i = i.prev;
                                                break;
                                            }
                                            if (!s.implicitlyClosed.hasOwnProperty(i.tagName)) break;
                                            i = i.prev;
                                        }
                                    else if (o)
                                        for (; i;) {
                                            var a = s.contextGrabbers[i.tagName];
                                            if (!a || !a.hasOwnProperty(o[2])) break;
                                            i = i.prev;
                                        }
                                    for (; i && i.prev && !i.startOfLine;) i = i.prev;
                                    return i ? i.indent + l : t.baseIndent || 0;
                                },
                                electricInput: /<\/[\s\w:]+>$/,
                                blockCommentStart: "\x3c!--",
                                blockCommentEnd: "--\x3e",
                                configuration: s.htmlMode ? "html" : "xml",
                                helperType: s.htmlMode ? "html" : "xml",
                                skipAttribute: function(e) {
                                    e.state == C && (e.state = x);
                                },
                            }
                        );
                    }),
                    e.defineMIME("text/xml", "xml"),
                    e.defineMIME("application/xml", "xml"),
                    e.mimeModes.hasOwnProperty("text/html") ||
                    e.defineMIME("text/html", { name: "xml", htmlMode: !0 });
            })(r(2));
        },
        function(e, t, r) {
            (function(e) {
                "use strict";
                e.defineMode("javascript", function(t, r) {
                        var n,
                            i,
                            o = t.indentUnit,
                            a = r.statementIndent,
                            l = r.jsonld,
                            s = r.json || l,
                            c = r.typescript,
                            u = r.wordCharacters || /[\w$\xa1-\uffff]/,
                            d = (function() {
                                function e(e) {
                                    return { type: e, style: "keyword" };
                                }
                                var t = e("keyword a"),
                                    r = e("keyword b"),
                                    n = e("keyword c"),
                                    i = e("keyword d"),
                                    o = e("operator"),
                                    a = { type: "atom", style: "atom" };
                                return {
                                    if: e("if"),
                                    while: t,
                                    with: t,
                                    else: r,
                                    do: r,
                                    try: r,
                                    finally: r,
                                    return: i,
                                    break: i,
                                    continue: i,
                                    new: e("new"),
                                    delete: n,
                                    void: n,
                                    throw: n,
                                    debugger: e("debugger"),
                                    var: e("var"),
                                    const: e("var"),
                                    let: e("var"),
                                    function: e("function"),
                                    catch: e("catch"),
                                    for: e("for"),
                                    switch: e("switch"),
                                    case: e("case"),
                                    default: e("default"),
                                    in: o,
                                    typeof: o,
                                    instanceof: o,
                                    true: a,
                                    false: a,
                                    null: a,
                                    undefined: a,
                                    NaN: a,
                                    Infinity: a,
                                    this: e("this"),
                                    class: e("class"),
                                    super: e("atom"),
                                    yield: n,
                                    export: e("export"),
                                    import: e("import"),
                                    extends: n,
                                    await: n,
                                };
                            })(),
                            f = /[+\-*&%=<>!?|~^@]/,
                            h = /^@(context|id|value|language|type|container|list|set|reverse|index|base|vocab|graph)"/;

                        function p(e, t, r) {
                            return (n = e), (i = r), t;
                        }

                        function m(e, t) {
                            var r,
                                n = e.next();
                            if ('"' == n || "'" == n)
                                return (
                                    (t.tokenize =
                                        ((r = n),
                                            function(e, t) {
                                                var n,
                                                    i = !1;
                                                if (l && "@" == e.peek() && e.match(h))
                                                    return (t.tokenize = m), p("jsonld-keyword", "meta");
                                                for (; null != (n = e.next()) && (n != r || i);) i = !i && "\\" == n;
                                                return i || (t.tokenize = m), p("string", "string");
                                            })),
                                    t.tokenize(e, t)
                                );
                            if ("." == n && e.match(/^\d+(?:[eE][+\-]?\d+)?/)) return p("number", "number");
                            if ("." == n && e.match("..")) return p("spread", "meta");
                            if (/[\[\]{}\(\),;\:\.]/.test(n)) return p(n);
                            if ("=" == n && e.eat(">")) return p("=>", "operator");
                            if ("0" == n && e.eat(/x/i)) return e.eatWhile(/[\da-f]/i), p("number", "number");
                            if ("0" == n && e.eat(/o/i)) return e.eatWhile(/[0-7]/i), p("number", "number");
                            if ("0" == n && e.eat(/b/i)) return e.eatWhile(/[01]/i), p("number", "number");
                            if (/\d/.test(n))
                                return e.match(/^\d*(?:\.\d*)?(?:[eE][+\-]?\d+)?/), p("number", "number");
                            if ("/" == n)
                                return e.eat("*") ?
                                    ((t.tokenize = g), g(e, t)) :
                                    e.eat("/") ?
                                    (e.skipToEnd(), p("comment", "comment")) :
                                    _e(e, t, 1) ?
                                    ((function(e) {
                                            for (var t, r = !1, n = !1; null != (t = e.next());) {
                                                if (!r) {
                                                    if ("/" == t && !n) return;
                                                    "[" == t ? (n = !0) : n && "]" == t && (n = !1);
                                                }
                                                r = !r && "\\" == t;
                                            }
                                        })(e),
                                        e.match(/^\b(([gimyu])(?![gimyu]*\2))+\b/),
                                        p("regexp", "string-2")) :
                                    (e.eat("="), p("operator", "operator", e.current()));
                            if ("`" == n) return (t.tokenize = v), v(e, t);
                            if ("#" == n) return e.skipToEnd(), p("error", "error");
                            if (f.test(n))
                                return (
                                    (">" == n && t.lexical && ">" == t.lexical.type) ||
                                    (e.eat("=") ?
                                        ("!" != n && "=" != n) || e.eat("=") :
                                        /[<>*+\-]/.test(n) && (e.eat(n), ">" == n && e.eat(n))),
                                    p("operator", "operator", e.current())
                                );
                            if (u.test(n)) {
                                e.eatWhile(u);
                                var i = e.current();
                                if ("." != t.lastType) {
                                    if (d.propertyIsEnumerable(i)) {
                                        var o = d[i];
                                        return p(o.type, o.style, i);
                                    }
                                    if ("async" == i && e.match(/^(\s|\/\*.*?\*\/)*[\(\w]/, !1))
                                        return p("async", "keyword", i);
                                }
                                return p("variable", "variable", i);
                            }
                        }

                        function g(e, t) {
                            for (var r, n = !1;
                                (r = e.next());) {
                                if ("/" == r && n) {
                                    t.tokenize = m;
                                    break;
                                }
                                n = "*" == r;
                            }
                            return p("comment", "comment");
                        }

                        function v(e, t) {
                            for (var r, n = !1; null != (r = e.next());) {
                                if (!n && ("`" == r || ("$" == r && e.eat("{")))) {
                                    t.tokenize = m;
                                    break;
                                }
                                n = !n && "\\" == r;
                            }
                            return p("quasi", "string-2", e.current());
                        }
                        var y = "([{}])";

                        function b(e, t) {
                            t.fatArrowAt && (t.fatArrowAt = null);
                            var r = e.string.indexOf("=>", e.start);
                            if (!(r < 0)) {
                                if (c) {
                                    var n = /:\s*(?:\w+(?:<[^>]*>|\[\])?|\{[^}]*\})\s*$/.exec(
                                        e.string.slice(e.start, r)
                                    );
                                    n && (r = n.index);
                                }
                                for (var i = 0, o = !1, a = r - 1; a >= 0; --a) {
                                    var l = e.string.charAt(a),
                                        s = y.indexOf(l);
                                    if (s >= 0 && s < 3) {
                                        if (!i) {
                                            ++a;
                                            break;
                                        }
                                        if (0 == --i) {
                                            "(" == l && (o = !0);
                                            break;
                                        }
                                    } else if (s >= 3 && s < 6) ++i;
                                    else if (u.test(l)) o = !0;
                                    else {
                                        if (/["'\/]/.test(l)) return;
                                        if (o && !i) {
                                            ++a;
                                            break;
                                        }
                                    }
                                }
                                o && !i && (t.fatArrowAt = a);
                            }
                        }
                        var w = {
                            "atom": !0,
                            "number": !0,
                            "variable": !0,
                            "string": !0,
                            "regexp": !0,
                            "this": !0,
                            "jsonld-keyword": !0,
                        };

                        function x(e, t, r, n, i, o) {
                            (this.indented = e),
                            (this.column = t),
                            (this.type = r),
                            (this.prev = i),
                            (this.info = o),
                            null != n && (this.align = n);
                        }

                        function k(e, t) {
                            for (var r = e.localVars; r; r = r.next)
                                if (r.name == t) return !0;
                            for (var n = e.context; n; n = n.prev)
                                for (r = n.vars; r; r = r.next)
                                    if (r.name == t) return !0;
                        }
                        var C = { state: null, column: null, marked: null, cc: null };

                        function S() {
                            for (var e = arguments.length - 1; e >= 0; e--) C.cc.push(arguments[e]);
                        }

                        function L() {
                            return S.apply(null, arguments), !0;
                        }

                        function M(e) {
                            function t(t) {
                                for (var r = t; r; r = r.next)
                                    if (r.name == e) return !0;
                                return !1;
                            }
                            var n = C.state;
                            if (((C.marked = "def"), n.context)) {
                                if (t(n.localVars)) return;
                                n.localVars = { name: e, next: n.localVars };
                            } else {
                                if (t(n.globalVars)) return;
                                r.globalVars && (n.globalVars = { name: e, next: n.globalVars });
                            }
                        }

                        function T(e) {
                            return (
                                "public" == e ||
                                "private" == e ||
                                "protected" == e ||
                                "abstract" == e ||
                                "readonly" == e
                            );
                        }
                        var O = { name: "this", next: { name: "arguments" } };

                        function A() {
                            (C.state.context = { prev: C.state.context, vars: C.state.localVars }),
                            (C.state.localVars = O);
                        }

                        function z() {
                            (C.state.localVars = C.state.context.vars), (C.state.context = C.state.context.prev);
                        }

                        function N(e, t) {
                            var r = function() {
                                var r = C.state,
                                    n = r.indented;
                                if ("stat" == r.lexical.type) n = r.lexical.indented;
                                else
                                    for (var i = r.lexical; i && ")" == i.type && i.align; i = i.prev)
                                        n = i.indented;
                                r.lexical = new x(n, C.stream.column(), e, null, r.lexical, t);
                            };
                            return (r.lex = !0), r;
                        }

                        function E() {
                            var e = C.state;
                            e.lexical.prev &&
                                (")" == e.lexical.type && (e.indented = e.lexical.indented),
                                    (e.lexical = e.lexical.prev));
                        }

                        function W(e) {
                            return function t(r) {
                                return r == e ? L() : ";" == e ? S() : L(t);
                            };
                        }

                        function P(e, t) {
                            return "var" == e ?
                                L(N("vardef", t.length), he, W(";"), E) :
                                "keyword a" == e ?
                                L(N("form"), I, P, E) :
                                "keyword b" == e ?
                                L(N("form"), P, E) :
                                "keyword d" == e ?
                                C.stream.match(/^\s*$/, !1) ?
                                L() :
                                L(N("stat"), F, W(";"), E) :
                                "debugger" == e ?
                                L(W(";")) :
                                "{" == e ?
                                L(N("}"), te, E) :
                                ";" == e ?
                                L() :
                                "if" == e ?
                                ("else" == C.state.lexical.info &&
                                    C.state.cc[C.state.cc.length - 1] == E &&
                                    C.state.cc.pop()(),
                                    L(N("form"), I, P, E, ye)) :
                                "function" == e ?
                                L(Se) :
                                "for" == e ?
                                L(N("form"), be, P, E) :
                                "class" == e || (c && "interface" == t) ?
                                ((C.marked = "keyword"), L(N("form"), Te, E)) :
                                "variable" == e ?
                                c && "declare" == t ?
                                ((C.marked = "keyword"), L(P)) :
                                c &&
                                ("module" == t || "enum" == t || "type" == t) &&
                                C.stream.match(/^\s*\w/, !1) ?
                                ((C.marked = "keyword"),
                                    "enum" == t ?
                                    L(Fe) :
                                    "type" == t ?
                                    L(oe, W("operator"), oe, W(";")) :
                                    L(N("form"), pe, W("{"), N("}"), te, E, E)) :
                                c && "namespace" == t ?
                                ((C.marked = "keyword"), L(N("form"), H, te, E)) :
                                L(N("stat"), G) :
                                "switch" == e ?
                                L(N("form"), I, W("{"), N("}", "switch"), te, E, E) :
                                "case" == e ?
                                L(H, W(":")) :
                                "default" == e ?
                                L(W(":")) :
                                "catch" == e ?
                                L(N("form"), A, W("("), Le, W(")"), P, E, z) :
                                "export" == e ?
                                L(N("stat"), Ne, E) :
                                "import" == e ?
                                L(N("stat"), We, E) :
                                "async" == e ?
                                L(P) :
                                "@" == t ?
                                L(H, P) :
                                S(N("stat"), H, W(";"), E);
                        }

                        function H(e, t) {
                            return j(e, t, !1);
                        }

                        function D(e, t) {
                            return j(e, t, !0);
                        }

                        function I(e) {
                            return "(" != e ? S() : L(N(")"), H, W(")"), E);
                        }

                        function j(e, t, r) {
                            if (C.state.fatArrowAt == C.stream.start) {
                                var n = r ? U : q;
                                if ("(" == e) return L(A, N(")"), J(Le, ")"), E, W("=>"), n, z);
                                if ("variable" == e) return S(A, pe, W("=>"), n, z);
                            }
                            var i = r ? _ : R;
                            return w.hasOwnProperty(e) ?
                                L(i) :
                                "function" == e ?
                                L(Se, i) :
                                "class" == e || (c && "interface" == t) ?
                                ((C.marked = "keyword"), L(N("form"), Me, E)) :
                                "keyword c" == e || "async" == e ?
                                L(r ? D : H) :
                                "(" == e ?
                                L(N(")"), F, W(")"), E, i) :
                                "operator" == e || "spread" == e ?
                                L(r ? D : H) :
                                "[" == e ?
                                L(N("]"), je, E, i) :
                                "{" == e ?
                                ee(Y, "}", null, i) :
                                "quasi" == e ?
                                S(B, i) :
                                "new" == e ?
                                L(
                                    (function(e) {
                                        return function(t) {
                                            return "." == t ?
                                                L(e ? K : V) :
                                                "variable" == t && c ?
                                                L(ue, e ? _ : R) :
                                                S(e ? D : H);
                                        };
                                    })(r)
                                ) :
                                L();
                        }

                        function F(e) {
                            return e.match(/[;\}\)\],]/) ? S() : S(H);
                        }

                        function R(e, t) {
                            return "," == e ? L(H) : _(e, t, !1);
                        }

                        function _(e, t, r) {
                            var n = 0 == r ? R : _,
                                i = 0 == r ? H : D;
                            return "=>" == e ?
                                L(A, r ? U : q, z) :
                                "operator" == e ?
                                /\+\+|--/.test(t) || (c && "!" == t) ?
                                L(n) :
                                c && "<" == t && C.stream.match(/^([^>]|<.*?>)*>\s*\(/, !1) ?
                                L(N(">"), J(oe, ">"), E, n) :
                                "?" == t ?
                                L(H, W(":"), i) :
                                L(i) :
                                "quasi" == e ?
                                S(B, n) :
                                ";" != e ?
                                "(" == e ?
                                ee(D, ")", "call", n) :
                                "." == e ?
                                L(X, n) :
                                "[" == e ?
                                L(N("]"), F, W("]"), E, n) :
                                c && "as" == t ?
                                ((C.marked = "keyword"), L(oe, n)) :
                                "regexp" == e ?
                                ((C.state.lastType = C.marked = "operator"),
                                    C.stream.backUp(C.stream.pos - C.stream.start - 1),
                                    L(i)) :
                                void 0 :
                                void 0;
                        }

                        function B(e, t) {
                            return "quasi" != e ? S() : "${" != t.slice(t.length - 2) ? L(B) : L(H, $);
                        }

                        function $(e) {
                            if ("}" == e) return (C.marked = "string-2"), (C.state.tokenize = v), L(B);
                        }

                        function q(e) {
                            return b(C.stream, C.state), S("{" == e ? P : H);
                        }

                        function U(e) {
                            return b(C.stream, C.state), S("{" == e ? P : D);
                        }

                        function V(e, t) {
                            if ("target" == t) return (C.marked = "keyword"), L(R);
                        }

                        function K(e, t) {
                            if ("target" == t) return (C.marked = "keyword"), L(_);
                        }

                        function G(e) {
                            return ":" == e ? L(E, P) : S(R, W(";"), E);
                        }

                        function X(e) {
                            if ("variable" == e) return (C.marked = "property"), L();
                        }

                        function Y(e, t) {
                            if ("async" == e) return (C.marked = "property"), L(Y);
                            if ("variable" == e || "keyword" == C.style) {
                                return (
                                    (C.marked = "property"),
                                    "get" == t || "set" == t ?
                                    L(Z) :
                                    (c &&
                                        C.state.fatArrowAt == C.stream.start &&
                                        (r = C.stream.match(/^\s*:\s*/, !1)) &&
                                        (C.state.fatArrowAt = C.stream.pos + r[0].length),
                                        L(Q))
                                );
                                var r;
                            } else {
                                if ("number" == e || "string" == e)
                                    return (C.marked = l ? "property" : C.style + " property"), L(Q);
                                if ("jsonld-keyword" == e) return L(Q);
                                if (c && T(t)) return (C.marked = "keyword"), L(Y);
                                if ("[" == e) return L(H, re, W("]"), Q);
                                if ("spread" == e) return L(D, Q);
                                if ("*" == t) return (C.marked = "keyword"), L(Y);
                                if (":" == e) return S(Q);
                            }
                        }

                        function Z(e) {
                            return "variable" != e ? S(Q) : ((C.marked = "property"), L(Se));
                        }

                        function Q(e) {
                            return ":" == e ? L(D) : "(" == e ? S(Se) : void 0;
                        }

                        function J(e, t, r) {
                            function n(i, o) {
                                if (r ? r.indexOf(i) > -1 : "," == i) {
                                    var a = C.state.lexical;
                                    return (
                                        "call" == a.info && (a.pos = (a.pos || 0) + 1),
                                        L(function(r, n) {
                                            return r == t || n == t ? S() : S(e);
                                        }, n)
                                    );
                                }
                                return i == t || o == t ? L() : L(W(t));
                            }
                            return function(r, i) {
                                return r == t || i == t ? L() : S(e, n);
                            };
                        }

                        function ee(e, t, r) {
                            for (var n = 3; n < arguments.length; n++) C.cc.push(arguments[n]);
                            return L(N(t, r), J(e, t), E);
                        }

                        function te(e) {
                            return "}" == e ? L() : S(P, te);
                        }

                        function re(e, t) {
                            if (c) {
                                if (":" == e) return L(oe);
                                if ("?" == t) return L(re);
                            }
                        }

                        function ne(e) {
                            if (c && ":" == e) return C.stream.match(/^\s*\w+\s+is\b/, !1) ? L(H, ie, oe) : L(oe);
                        }

                        function ie(e, t) {
                            if ("is" == t) return (C.marked = "keyword"), L();
                        }

                        function oe(e, t) {
                            return "variable" == e || "void" == t ?
                                "keyof" == t ?
                                ((C.marked = "keyword"), L(oe)) :
                                ((C.marked = "type"), L(ce)) :
                                "string" == e || "number" == e || "atom" == e ?
                                L(ce) :
                                "[" == e ?
                                L(N("]"), J(oe, "]", ","), E, ce) :
                                "{" == e ?
                                L(N("}"), J(le, "}", ",;"), E, ce) :
                                "(" == e ?
                                L(J(se, ")"), ae) :
                                void 0;
                        }

                        function ae(e) {
                            if ("=>" == e) return L(oe);
                        }

                        function le(e, t) {
                            return "variable" == e || "keyword" == C.style ?
                                ((C.marked = "property"), L(le)) :
                                "?" == t ?
                                L(le) :
                                ":" == e ?
                                L(oe) :
                                "[" == e ?
                                L(H, re, W("]"), le) :
                                void 0;
                        }

                        function se(e) {
                            return "variable" == e ? L(se) : ":" == e ? L(oe) : void 0;
                        }

                        function ce(e, t) {
                            return "<" == t ?
                                L(N(">"), J(oe, ">"), E, ce) :
                                "|" == t || "." == e ?
                                L(oe) :
                                "[" == e ?
                                L(W("]"), ce) :
                                "extends" == t || "implements" == t ?
                                ((C.marked = "keyword"), L(oe)) :
                                void 0;
                        }

                        function ue(e, t) {
                            if ("<" == t) return L(N(">"), J(oe, ">"), E, ce);
                        }

                        function de() {
                            return S(oe, fe);
                        }

                        function fe(e, t) {
                            if ("=" == t) return L(oe);
                        }

                        function he(e, t) {
                            return "enum" == t ? ((C.marked = "keyword"), L(Fe)) : S(pe, re, ge, ve);
                        }

                        function pe(e, t) {
                            return c && T(t) ?
                                ((C.marked = "keyword"), L(pe)) :
                                "variable" == e ?
                                (M(t), L()) :
                                "spread" == e ?
                                L(pe) :
                                "[" == e ?
                                ee(pe, "]") :
                                "{" == e ?
                                ee(me, "}") :
                                void 0;
                        }

                        function me(e, t) {
                            return "variable" != e || C.stream.match(/^\s*:/, !1) ?
                                ("variable" == e && (C.marked = "property"),
                                    "spread" == e ? L(pe) : "}" == e ? S() : L(W(":"), pe, ge)) :
                                (M(t), L(ge));
                        }

                        function ge(e, t) {
                            if ("=" == t) return L(D);
                        }

                        function ve(e) {
                            if ("," == e) return L(he);
                        }

                        function ye(e, t) {
                            if ("keyword b" == e && "else" == t) return L(N("form", "else"), P, E);
                        }

                        function be(e) {
                            if ("(" == e) return L(N(")"), we, W(")"), E);
                        }

                        function we(e) {
                            return "var" == e ?
                                L(he, W(";"), ke) :
                                ";" == e ?
                                L(ke) :
                                "variable" == e ?
                                L(xe) :
                                S(H, W(";"), ke);
                        }

                        function xe(e, t) {
                            return "in" == t || "of" == t ? ((C.marked = "keyword"), L(H)) : L(R, ke);
                        }

                        function ke(e, t) {
                            return ";" == e ?
                                L(Ce) :
                                "in" == t || "of" == t ?
                                ((C.marked = "keyword"), L(H)) :
                                S(H, W(";"), Ce);
                        }

                        function Ce(e) {
                            ")" != e && L(H);
                        }

                        function Se(e, t) {
                            return "*" == t ?
                                ((C.marked = "keyword"), L(Se)) :
                                "variable" == e ?
                                (M(t), L(Se)) :
                                "(" == e ?
                                L(A, N(")"), J(Le, ")"), E, ne, P, z) :
                                c && "<" == t ?
                                L(N(">"), J(de, ">"), E, Se) :
                                void 0;
                        }

                        function Le(e, t) {
                            return (
                                "@" == t && L(H, Le),
                                "spread" == e ?
                                L(Le) :
                                c && T(t) ?
                                ((C.marked = "keyword"), L(Le)) :
                                S(pe, re, ge)
                            );
                        }

                        function Me(e, t) {
                            return "variable" == e ? Te(e, t) : Oe(e, t);
                        }

                        function Te(e, t) {
                            if ("variable" == e) return M(t), L(Oe);
                        }

                        function Oe(e, t) {
                            return "<" == t ?
                                L(N(">"), J(de, ">"), E, Oe) :
                                "extends" == t || "implements" == t || (c && "," == e) ?
                                ("implements" == t && (C.marked = "keyword"), L(c ? oe : H, Oe)) :
                                "{" == e ?
                                L(N("}"), Ae, E) :
                                void 0;
                        }

                        function Ae(e, t) {
                            return "async" == e ||
                                ("variable" == e &&
                                    ("static" == t || "get" == t || "set" == t || (c && T(t))) &&
                                    C.stream.match(/^\s+[\w$\xa1-\uffff]/, !1)) ?
                                ((C.marked = "keyword"), L(Ae)) :
                                "variable" == e || "keyword" == C.style ?
                                ((C.marked = "property"), L(c ? ze : Se, Ae)) :
                                "[" == e ?
                                L(H, re, W("]"), c ? ze : Se, Ae) :
                                "*" == t ?
                                ((C.marked = "keyword"), L(Ae)) :
                                ";" == e ?
                                L(Ae) :
                                "}" == e ?
                                L() :
                                "@" == t ?
                                L(H, Ae) :
                                void 0;
                        }

                        function ze(e, t) {
                            return "?" == t ? L(ze) : ":" == e ? L(oe, ge) : "=" == t ? L(D) : S(Se);
                        }

                        function Ne(e, t) {
                            return "*" == t ?
                                ((C.marked = "keyword"), L(Ie, W(";"))) :
                                "default" == t ?
                                ((C.marked = "keyword"), L(H, W(";"))) :
                                "{" == e ?
                                L(J(Ee, "}"), Ie, W(";")) :
                                S(P);
                        }

                        function Ee(e, t) {
                            return "as" == t ?
                                ((C.marked = "keyword"), L(W("variable"))) :
                                "variable" == e ?
                                S(D, Ee) :
                                void 0;
                        }

                        function We(e) {
                            return "string" == e ? L() : S(Pe, He, Ie);
                        }

                        function Pe(e, t) {
                            return "{" == e ?
                                ee(Pe, "}") :
                                ("variable" == e && M(t), "*" == t && (C.marked = "keyword"), L(De));
                        }

                        function He(e) {
                            if ("," == e) return L(Pe, He);
                        }

                        function De(e, t) {
                            if ("as" == t) return (C.marked = "keyword"), L(Pe);
                        }

                        function Ie(e, t) {
                            if ("from" == t) return (C.marked = "keyword"), L(H);
                        }

                        function je(e) {
                            return "]" == e ? L() : S(J(D, "]"));
                        }

                        function Fe() {
                            return S(N("form"), pe, W("{"), N("}"), J(Re, "}"), E, E);
                        }

                        function Re() {
                            return S(pe, ge);
                        }

                        function _e(e, t, r) {
                            return (
                                (t.tokenize == m &&
                                    /^(?:operator|sof|keyword [bcd]|case|new|export|default|spread|[\[{}\(,;:]|=>)$/.test(
                                        t.lastType
                                    )) ||
                                ("quasi" == t.lastType && /\{\s*$/.test(e.string.slice(0, e.pos - (r || 0))))
                            );
                        }
                        return (
                            (E.lex = !0), {
                                startState: function(e) {
                                    var t = {
                                        tokenize: m,
                                        lastType: "sof",
                                        cc: [],
                                        lexical: new x((e || 0) - o, 0, "block", !1),
                                        localVars: r.localVars,
                                        context: r.localVars && { vars: r.localVars },
                                        indented: e || 0,
                                    };
                                    return (
                                        r.globalVars &&
                                        "object" == typeof r.globalVars &&
                                        (t.globalVars = r.globalVars),
                                        t
                                    );
                                },
                                token: function(e, t) {
                                    if (
                                        (e.sol() &&
                                            (t.lexical.hasOwnProperty("align") || (t.lexical.align = !1),
                                                (t.indented = e.indentation()),
                                                b(e, t)),
                                            t.tokenize != g && e.eatSpace())
                                    )
                                        return null;
                                    var r = t.tokenize(e, t);
                                    return "comment" == n ?
                                        r :
                                        ((t.lastType =
                                                "operator" != n || ("++" != i && "--" != i) ? n : "incdec"),
                                            (function(e, t, r, n, i) {
                                                var o = e.cc;
                                                for (
                                                    C.state = e,
                                                    C.stream = i,
                                                    C.marked = null,
                                                    C.cc = o,
                                                    C.style = t,
                                                    e.lexical.hasOwnProperty("align") || (e.lexical.align = !0);;

                                                )
                                                    if ((o.length ? o.pop() : s ? H : P)(r, n)) {
                                                        for (; o.length && o[o.length - 1].lex;) o.pop()();
                                                        return C.marked ?
                                                            C.marked :
                                                            "variable" == r && k(e, n) ?
                                                            "variable-2" :
                                                            t;
                                                    }
                                            })(t, r, n, i, e));
                                },
                                indent: function(t, n) {
                                    if (t.tokenize == g) return e.Pass;
                                    if (t.tokenize != m) return 0;
                                    var i,
                                        l = n && n.charAt(0),
                                        s = t.lexical;
                                    if (!/^\s*else\b/.test(n))
                                        for (var c = t.cc.length - 1; c >= 0; --c) {
                                            var u = t.cc[c];
                                            if (u == E) s = s.prev;
                                            else if (u != ye) break;
                                        }
                                    for (;
                                        ("stat" == s.type || "form" == s.type) &&
                                        ("}" == l ||
                                            ((i = t.cc[t.cc.length - 1]) &&
                                                (i == R || i == _) &&
                                                !/^[,\.=+\-*:?[\(]/.test(n)));

                                    )
                                        s = s.prev;
                                    a && ")" == s.type && "stat" == s.prev.type && (s = s.prev);
                                    var d = s.type,
                                        h = l == d;
                                    return "vardef" == d ?
                                        s.indented +
                                        ("operator" == t.lastType || "," == t.lastType ? s.info + 1 : 0) :
                                        "form" == d && "{" == l ?
                                        s.indented :
                                        "form" == d ?
                                        s.indented + o :
                                        "stat" == d ?
                                        s.indented +
                                        ((function(e, t) {
                                                return (
                                                    "operator" == e.lastType ||
                                                    "," == e.lastType ||
                                                    f.test(t.charAt(0)) ||
                                                    /[,.]/.test(t.charAt(0))
                                                );
                                            })(t, n) ?
                                            a || o :
                                            0) :
                                        "switch" != s.info || h || 0 == r.doubleIndentSwitch ?
                                        s.align ?
                                        s.column + (h ? 0 : 1) :
                                        s.indented + (h ? 0 : o) :
                                        s.indented + (/^(?:case|default)\b/.test(n) ? o : 2 * o);
                                },
                                electricInput: /^\s*(?:case .*?:|default:|\{|\})$/,
                                blockCommentStart: s ? null : "/*",
                                blockCommentEnd: s ? null : "*/",
                                blockCommentContinue: s ? null : " * ",
                                lineComment: s ? null : "//",
                                fold: "brace",
                                closeBrackets: "()[]{}''\"\"``",
                                helperType: s ? "json" : "javascript",
                                jsonldMode: l,
                                jsonMode: s,
                                expressionAllowed: _e,
                                skipExpression: function(e) {
                                    var t = e.cc[e.cc.length - 1];
                                    (t != H && t != D) || e.cc.pop();
                                },
                            }
                        );
                    }),
                    e.registerHelper("wordChars", "javascript", /[\w$]/),
                    e.defineMIME("text/javascript", "javascript"),
                    e.defineMIME("text/ecmascript", "javascript"),
                    e.defineMIME("application/javascript", "javascript"),
                    e.defineMIME("application/x-javascript", "javascript"),
                    e.defineMIME("application/ecmascript", "javascript"),
                    e.defineMIME("application/json", { name: "javascript", json: !0 }),
                    e.defineMIME("application/x-json", { name: "javascript", json: !0 }),
                    e.defineMIME("application/ld+json", { name: "javascript", jsonld: !0 }),
                    e.defineMIME("text/typescript", { name: "javascript", typescript: !0 }),
                    e.defineMIME("application/typescript", { name: "javascript", typescript: !0 });
            })(r(2));
        },
        function(e, t, r) {
            (function(e) {
                "use strict";

                function t(e) {
                    for (var t = {}, r = 0; r < e.length; ++r) t[e[r].toLowerCase()] = !0;
                    return t;
                }
                e.defineMode("css", function(t, r) {
                    var n = r.inline;
                    r.propertyKeywords || (r = e.resolveMode("text/css"));
                    var i,
                        o,
                        a = t.indentUnit,
                        l = r.tokenHooks,
                        s = r.documentTypes || {},
                        c = r.mediaTypes || {},
                        u = r.mediaFeatures || {},
                        d = r.mediaValueKeywords || {},
                        f = r.propertyKeywords || {},
                        h = r.nonStandardPropertyKeywords || {},
                        p = r.fontProperties || {},
                        m = r.counterDescriptors || {},
                        g = r.colorKeywords || {},
                        v = r.valueKeywords || {},
                        y = r.allowNested,
                        b = r.lineComment,
                        w = !0 === r.supportsAtComponent;

                    function x(e, t) {
                        return (i = t), e;
                    }

                    function k(e) {
                        return function(t, r) {
                            for (var n, i = !1; null != (n = t.next());) {
                                if (n == e && !i) {
                                    ")" == e && t.backUp(1);
                                    break;
                                }
                                i = !i && "\\" == n;
                            }
                            return (n == e || (!i && ")" != e)) && (r.tokenize = null), x("string", "string");
                        };
                    }

                    function C(e, t) {
                        return (
                            e.next(),
                            e.match(/\s*[\"\')]/, !1) ? (t.tokenize = null) : (t.tokenize = k(")")),
                            x(null, "(")
                        );
                    }

                    function S(e, t, r) {
                        (this.type = e), (this.indent = t), (this.prev = r);
                    }

                    function L(e, t, r, n) {
                        return (e.context = new S(r, t.indentation() + (!1 === n ? 0 : a), e.context)), r;
                    }

                    function M(e) {
                        return e.context.prev && (e.context = e.context.prev), e.context.type;
                    }

                    function T(e, t, r) {
                        return z[r.context.type](e, t, r);
                    }

                    function O(e, t, r, n) {
                        for (var i = n || 1; i > 0; i--) r.context = r.context.prev;
                        return T(e, t, r);
                    }

                    function A(e) {
                        var t = e.current().toLowerCase();
                        o = v.hasOwnProperty(t) ? "atom" : g.hasOwnProperty(t) ? "keyword" : "variable";
                    }
                    var z = {
                        top: function(e, t, r) {
                            if ("{" == e) return L(r, t, "block");
                            if ("}" == e && r.context.prev) return M(r);
                            if (w && /@component/i.test(e)) return L(r, t, "atComponentBlock");
                            if (/^@(-moz-)?document$/i.test(e)) return L(r, t, "documentTypes");
                            if (/^@(media|supports|(-moz-)?document|import)$/i.test(e))
                                return L(r, t, "atBlock");
                            if (/^@(font-face|counter-style)/i.test(e))
                                return (r.stateArg = e), "restricted_atBlock_before";
                            if (/^@(-(moz|ms|o|webkit)-)?keyframes$/i.test(e)) return "keyframes";
                            if (e && "@" == e.charAt(0)) return L(r, t, "at");
                            if ("hash" == e) o = "builtin";
                            else if ("word" == e) o = "tag";
                            else {
                                if ("variable-definition" == e) return "maybeprop";
                                if ("interpolation" == e) return L(r, t, "interpolation");
                                if (":" == e) return "pseudo";
                                if (y && "(" == e) return L(r, t, "parens");
                            }
                            return r.context.type;
                        },
                        block: function(e, t, r) {
                            if ("word" == e) {
                                var n = t.current().toLowerCase();
                                return f.hasOwnProperty(n) ?
                                    ((o = "property"), "maybeprop") :
                                    h.hasOwnProperty(n) ?
                                    ((o = "string-2"), "maybeprop") :
                                    y ?
                                    ((o = t.match(/^\s*:(?:\s|$)/, !1) ? "property" : "tag"), "block") :
                                    ((o += " error"), "maybeprop");
                            }
                            return "meta" == e ?
                                "block" :
                                y || ("hash" != e && "qualifier" != e) ?
                                z.top(e, t, r) :
                                ((o = "error"), "block");
                        },
                        maybeprop: function(e, t, r) {
                            return ":" == e ? L(r, t, "prop") : T(e, t, r);
                        },
                        prop: function(e, t, r) {
                            if (";" == e) return M(r);
                            if ("{" == e && y) return L(r, t, "propBlock");
                            if ("}" == e || "{" == e) return O(e, t, r);
                            if ("(" == e) return L(r, t, "parens");
                            if (
                                "hash" != e ||
                                /^#([0-9a-fA-f]{3,4}|[0-9a-fA-f]{6}|[0-9a-fA-f]{8})$/.test(t.current())
                            ) {
                                if ("word" == e) A(t);
                                else if ("interpolation" == e) return L(r, t, "interpolation");
                            } else o += " error";
                            return "prop";
                        },
                        propBlock: function(e, t, r) {
                            return "}" == e ?
                                M(r) :
                                "word" == e ?
                                ((o = "property"), "maybeprop") :
                                r.context.type;
                        },
                        parens: function(e, t, r) {
                            return "{" == e || "}" == e ?
                                O(e, t, r) :
                                ")" == e ?
                                M(r) :
                                "(" == e ?
                                L(r, t, "parens") :
                                "interpolation" == e ?
                                L(r, t, "interpolation") :
                                ("word" == e && A(t), "parens");
                        },
                        pseudo: function(e, t, r) {
                            return "meta" == e ?
                                "pseudo" :
                                "word" == e ?
                                ((o = "variable-3"), r.context.type) :
                                T(e, t, r);
                        },
                        documentTypes: function(e, t, r) {
                            return "word" == e && s.hasOwnProperty(t.current()) ?
                                ((o = "tag"), r.context.type) :
                                z.atBlock(e, t, r);
                        },
                        atBlock: function(e, t, r) {
                            if ("(" == e) return L(r, t, "atBlock_parens");
                            if ("}" == e || ";" == e) return O(e, t, r);
                            if ("{" == e) return M(r) && L(r, t, y ? "block" : "top");
                            if ("interpolation" == e) return L(r, t, "interpolation");
                            if ("word" == e) {
                                var n = t.current().toLowerCase();
                                o =
                                    "only" == n || "not" == n || "and" == n || "or" == n ?
                                    "keyword" :
                                    c.hasOwnProperty(n) ?
                                    "attribute" :
                                    u.hasOwnProperty(n) ?
                                    "property" :
                                    d.hasOwnProperty(n) ?
                                    "keyword" :
                                    f.hasOwnProperty(n) ?
                                    "property" :
                                    h.hasOwnProperty(n) ?
                                    "string-2" :
                                    v.hasOwnProperty(n) ?
                                    "atom" :
                                    g.hasOwnProperty(n) ?
                                    "keyword" :
                                    "error";
                            }
                            return r.context.type;
                        },
                        atComponentBlock: function(e, t, r) {
                            return "}" == e ?
                                O(e, t, r) :
                                "{" == e ?
                                M(r) && L(r, t, y ? "block" : "top", !1) :
                                ("word" == e && (o = "error"), r.context.type);
                        },
                        atBlock_parens: function(e, t, r) {
                            return ")" == e ?
                                M(r) :
                                "{" == e || "}" == e ?
                                O(e, t, r, 2) :
                                z.atBlock(e, t, r);
                        },
                        restricted_atBlock_before: function(e, t, r) {
                            return "{" == e ?
                                L(r, t, "restricted_atBlock") :
                                "word" == e && "@counter-style" == r.stateArg ?
                                ((o = "variable"), "restricted_atBlock_before") :
                                T(e, t, r);
                        },
                        restricted_atBlock: function(e, t, r) {
                            return "}" == e ?
                                ((r.stateArg = null), M(r)) :
                                "word" == e ?
                                ((o =
                                        ("@font-face" == r.stateArg &&
                                            !p.hasOwnProperty(t.current().toLowerCase())) ||
                                        ("@counter-style" == r.stateArg &&
                                            !m.hasOwnProperty(t.current().toLowerCase())) ?
                                        "error" :
                                        "property"),
                                    "maybeprop") :
                                "restricted_atBlock";
                        },
                        keyframes: function(e, t, r) {
                            return "word" == e ?
                                ((o = "variable"), "keyframes") :
                                "{" == e ?
                                L(r, t, "top") :
                                T(e, t, r);
                        },
                        at: function(e, t, r) {
                            return ";" == e ?
                                M(r) :
                                "{" == e || "}" == e ?
                                O(e, t, r) :
                                ("word" == e ? (o = "tag") : "hash" == e && (o = "builtin"), "at");
                        },
                        interpolation: function(e, t, r) {
                            return "}" == e ?
                                M(r) :
                                "{" == e || ";" == e ?
                                O(e, t, r) :
                                ("word" == e ?
                                    (o = "variable") :
                                    "variable" != e && "(" != e && ")" != e && (o = "error"),
                                    "interpolation");
                        },
                    };
                    return {
                        startState: function(e) {
                            return {
                                tokenize: null,
                                state: n ? "block" : "top",
                                stateArg: null,
                                context: new S(n ? "block" : "top", e || 0, null),
                            };
                        },
                        token: function(e, t) {
                            if (!t.tokenize && e.eatSpace()) return null;
                            var r = (
                                t.tokenize ||
                                function(e, t) {
                                    var r = e.next();
                                    if (l[r]) {
                                        var n = l[r](e, t);
                                        if (!1 !== n) return n;
                                    }
                                    return "@" == r ?
                                        (e.eatWhile(/[\w\\\-]/), x("def", e.current())) :
                                        "=" == r || (("~" == r || "|" == r) && e.eat("=")) ?
                                        x(null, "compare") :
                                        '"' == r || "'" == r ?
                                        ((t.tokenize = k(r)), t.tokenize(e, t)) :
                                        "#" == r ?
                                        (e.eatWhile(/[\w\\\-]/), x("atom", "hash")) :
                                        "!" == r ?
                                        (e.match(/^\s*\w*/), x("keyword", "important")) :
                                        /\d/.test(r) || ("." == r && e.eat(/\d/)) ?
                                        (e.eatWhile(/[\w.%]/), x("number", "unit")) :
                                        "-" !== r ?
                                        /[,+>*\/]/.test(r) ?
                                        x(null, "select-op") :
                                        "." == r && e.match(/^-?[_a-z][_a-z0-9-]*/i) ?
                                        x("qualifier", "qualifier") :
                                        /[:;{}\[\]\(\)]/.test(r) ?
                                        x(null, r) :
                                        (("u" == r || "U" == r) && e.match(/rl(-prefix)?\(/i)) ||
                                        (("d" == r || "D" == r) && e.match("omain(", !0, !0)) ||
                                        (("r" == r || "R" == r) && e.match("egexp(", !0, !0)) ?
                                        (e.backUp(1), (t.tokenize = C), x("property", "word")) :
                                        /[\w\\\-]/.test(r) ?
                                        (e.eatWhile(/[\w\\\-]/), x("property", "word")) :
                                        x(null, null) :
                                        /[\d.]/.test(e.peek()) ?
                                        (e.eatWhile(/[\w.%]/), x("number", "unit")) :
                                        e.match(/^-[\w\\\-]+/) ?
                                        (e.eatWhile(/[\w\\\-]/),
                                            e.match(/^\s*:/, !1) ?
                                            x("variable-2", "variable-definition") :
                                            x("variable-2", "variable")) :
                                        e.match(/^\w+-/) ?
                                        x("meta", "meta") :
                                        void 0;
                                }
                            )(e, t);
                            return (
                                r && "object" == typeof r && ((i = r[1]), (r = r[0])),
                                (o = r),
                                "comment" != i && (t.state = z[t.state](i, e, t)),
                                o
                            );
                        },
                        indent: function(e, t) {
                            var r = e.context,
                                n = t && t.charAt(0),
                                i = r.indent;
                            return (
                                "prop" != r.type || ("}" != n && ")" != n) || (r = r.prev),
                                r.prev &&
                                ("}" != n ||
                                    ("block" != r.type &&
                                        "top" != r.type &&
                                        "interpolation" != r.type &&
                                        "restricted_atBlock" != r.type) ?
                                    ((")" != n || ("parens" != r.type && "atBlock_parens" != r.type)) &&
                                        ("{" != n || ("at" != r.type && "atBlock" != r.type))) ||
                                    (i = Math.max(0, r.indent - a)) :
                                    (i = (r = r.prev).indent)),
                                i
                            );
                        },
                        electricChars: "}",
                        blockCommentStart: "/*",
                        blockCommentEnd: "*/",
                        blockCommentContinue: " * ",
                        lineComment: b,
                        fold: "brace",
                    };
                });
                var r = ["domain", "regexp", "url", "url-prefix"],
                    n = t(r),
                    i = [
                        "all",
                        "aural",
                        "braille",
                        "handheld",
                        "print",
                        "projection",
                        "screen",
                        "tty",
                        "tv",
                        "embossed",
                    ],
                    o = t(i),
                    a = [
                        "width",
                        "min-width",
                        "max-width",
                        "height",
                        "min-height",
                        "max-height",
                        "device-width",
                        "min-device-width",
                        "max-device-width",
                        "device-height",
                        "min-device-height",
                        "max-device-height",
                        "aspect-ratio",
                        "min-aspect-ratio",
                        "max-aspect-ratio",
                        "device-aspect-ratio",
                        "min-device-aspect-ratio",
                        "max-device-aspect-ratio",
                        "color",
                        "min-color",
                        "max-color",
                        "color-index",
                        "min-color-index",
                        "max-color-index",
                        "monochrome",
                        "min-monochrome",
                        "max-monochrome",
                        "resolution",
                        "min-resolution",
                        "max-resolution",
                        "scan",
                        "grid",
                        "orientation",
                        "device-pixel-ratio",
                        "min-device-pixel-ratio",
                        "max-device-pixel-ratio",
                        "pointer",
                        "any-pointer",
                        "hover",
                        "any-hover",
                    ],
                    l = t(a),
                    s = [
                        "landscape",
                        "portrait",
                        "none",
                        "coarse",
                        "fine",
                        "on-demand",
                        "hover",
                        "interlace",
                        "progressive",
                    ],
                    c = t(s),
                    u = [
                        "align-content",
                        "align-items",
                        "align-self",
                        "alignment-adjust",
                        "alignment-baseline",
                        "anchor-point",
                        "animation",
                        "animation-delay",
                        "animation-direction",
                        "animation-duration",
                        "animation-fill-mode",
                        "animation-iteration-count",
                        "animation-name",
                        "animation-play-state",
                        "animation-timing-function",
                        "appearance",
                        "azimuth",
                        "backface-visibility",
                        "background",
                        "background-attachment",
                        "background-blend-mode",
                        "background-clip",
                        "background-color",
                        "background-image",
                        "background-origin",
                        "background-position",
                        "background-repeat",
                        "background-size",
                        "baseline-shift",
                        "binding",
                        "bleed",
                        "bookmark-label",
                        "bookmark-level",
                        "bookmark-state",
                        "bookmark-target",
                        "border",
                        "border-bottom",
                        "border-bottom-color",
                        "border-bottom-left-radius",
                        "border-bottom-right-radius",
                        "border-bottom-style",
                        "border-bottom-width",
                        "border-collapse",
                        "border-color",
                        "border-image",
                        "border-image-outset",
                        "border-image-repeat",
                        "border-image-slice",
                        "border-image-source",
                        "border-image-width",
                        "border-left",
                        "border-left-color",
                        "border-left-style",
                        "border-left-width",
                        "border-radius",
                        "border-right",
                        "border-right-color",
                        "border-right-style",
                        "border-right-width",
                        "border-spacing",
                        "border-style",
                        "border-top",
                        "border-top-color",
                        "border-top-left-radius",
                        "border-top-right-radius",
                        "border-top-style",
                        "border-top-width",
                        "border-width",
                        "bottom",
                        "box-decoration-break",
                        "box-shadow",
                        "box-sizing",
                        "break-after",
                        "break-before",
                        "break-inside",
                        "caption-side",
                        "caret-color",
                        "clear",
                        "clip",
                        "color",
                        "color-profile",
                        "column-count",
                        "column-fill",
                        "column-gap",
                        "column-rule",
                        "column-rule-color",
                        "column-rule-style",
                        "column-rule-width",
                        "column-span",
                        "column-width",
                        "columns",
                        "content",
                        "counter-increment",
                        "counter-reset",
                        "crop",
                        "cue",
                        "cue-after",
                        "cue-before",
                        "cursor",
                        "direction",
                        "display",
                        "dominant-baseline",
                        "drop-initial-after-adjust",
                        "drop-initial-after-align",
                        "drop-initial-before-adjust",
                        "drop-initial-before-align",
                        "drop-initial-size",
                        "drop-initial-value",
                        "elevation",
                        "empty-cells",
                        "fit",
                        "fit-position",
                        "flex",
                        "flex-basis",
                        "flex-direction",
                        "flex-flow",
                        "flex-grow",
                        "flex-shrink",
                        "flex-wrap",
                        "float",
                        "float-offset",
                        "flow-from",
                        "flow-into",
                        "font",
                        "font-feature-settings",
                        "font-family",
                        "font-kerning",
                        "font-language-override",
                        "font-size",
                        "font-size-adjust",
                        "font-stretch",
                        "font-style",
                        "font-synthesis",
                        "font-variant",
                        "font-variant-alternates",
                        "font-variant-caps",
                        "font-variant-east-asian",
                        "font-variant-ligatures",
                        "font-variant-numeric",
                        "font-variant-position",
                        "font-weight",
                        "grid",
                        "grid-area",
                        "grid-auto-columns",
                        "grid-auto-flow",
                        "grid-auto-rows",
                        "grid-column",
                        "grid-column-end",
                        "grid-column-gap",
                        "grid-column-start",
                        "grid-gap",
                        "grid-row",
                        "grid-row-end",
                        "grid-row-gap",
                        "grid-row-start",
                        "grid-template",
                        "grid-template-areas",
                        "grid-template-columns",
                        "grid-template-rows",
                        "hanging-punctuation",
                        "height",
                        "hyphens",
                        "icon",
                        "image-orientation",
                        "image-rendering",
                        "image-resolution",
                        "inline-box-align",
                        "justify-content",
                        "justify-items",
                        "justify-self",
                        "left",
                        "letter-spacing",
                        "line-break",
                        "line-height",
                        "line-stacking",
                        "line-stacking-ruby",
                        "line-stacking-shift",
                        "line-stacking-strategy",
                        "list-style",
                        "list-style-image",
                        "list-style-position",
                        "list-style-type",
                        "margin",
                        "margin-bottom",
                        "margin-left",
                        "margin-right",
                        "margin-top",
                        "marks",
                        "marquee-direction",
                        "marquee-loop",
                        "marquee-play-count",
                        "marquee-speed",
                        "marquee-style",
                        "max-height",
                        "max-width",
                        "min-height",
                        "min-width",
                        "move-to",
                        "nav-down",
                        "nav-index",
                        "nav-left",
                        "nav-right",
                        "nav-up",
                        "object-fit",
                        "object-position",
                        "opacity",
                        "order",
                        "orphans",
                        "outline",
                        "outline-color",
                        "outline-offset",
                        "outline-style",
                        "outline-width",
                        "overflow",
                        "overflow-style",
                        "overflow-wrap",
                        "overflow-x",
                        "overflow-y",
                        "padding",
                        "padding-bottom",
                        "padding-left",
                        "padding-right",
                        "padding-top",
                        "page",
                        "page-break-after",
                        "page-break-before",
                        "page-break-inside",
                        "page-policy",
                        "pause",
                        "pause-after",
                        "pause-before",
                        "perspective",
                        "perspective-origin",
                        "pitch",
                        "pitch-range",
                        "place-content",
                        "place-items",
                        "place-self",
                        "play-during",
                        "position",
                        "presentation-level",
                        "punctuation-trim",
                        "quotes",
                        "region-break-after",
                        "region-break-before",
                        "region-break-inside",
                        "region-fragment",
                        "rendering-intent",
                        "resize",
                        "rest",
                        "rest-after",
                        "rest-before",
                        "richness",
                        "right",
                        "rotation",
                        "rotation-point",
                        "ruby-align",
                        "ruby-overhang",
                        "ruby-position",
                        "ruby-span",
                        "shape-image-threshold",
                        "shape-inside",
                        "shape-margin",
                        "shape-outside",
                        "size",
                        "speak",
                        "speak-as",
                        "speak-header",
                        "speak-numeral",
                        "speak-punctuation",
                        "speech-rate",
                        "stress",
                        "string-set",
                        "tab-size",
                        "table-layout",
                        "target",
                        "target-name",
                        "target-new",
                        "target-position",
                        "text-align",
                        "text-align-last",
                        "text-decoration",
                        "text-decoration-color",
                        "text-decoration-line",
                        "text-decoration-skip",
                        "text-decoration-style",
                        "text-emphasis",
                        "text-emphasis-color",
                        "text-emphasis-position",
                        "text-emphasis-style",
                        "text-height",
                        "text-indent",
                        "text-justify",
                        "text-outline",
                        "text-overflow",
                        "text-shadow",
                        "text-size-adjust",
                        "text-space-collapse",
                        "text-transform",
                        "text-underline-position",
                        "text-wrap",
                        "top",
                        "transform",
                        "transform-origin",
                        "transform-style",
                        "transition",
                        "transition-delay",
                        "transition-duration",
                        "transition-property",
                        "transition-timing-function",
                        "unicode-bidi",
                        "user-select",
                        "vertical-align",
                        "visibility",
                        "voice-balance",
                        "voice-duration",
                        "voice-family",
                        "voice-pitch",
                        "voice-range",
                        "voice-rate",
                        "voice-stress",
                        "voice-volume",
                        "volume",
                        "white-space",
                        "widows",
                        "width",
                        "will-change",
                        "word-break",
                        "word-spacing",
                        "word-wrap",
                        "z-index",
                        "clip-path",
                        "clip-rule",
                        "mask",
                        "enable-background",
                        "filter",
                        "flood-color",
                        "flood-opacity",
                        "lighting-color",
                        "stop-color",
                        "stop-opacity",
                        "pointer-events",
                        "color-interpolation",
                        "color-interpolation-filters",
                        "color-rendering",
                        "fill",
                        "fill-opacity",
                        "fill-rule",
                        "image-rendering",
                        "marker",
                        "marker-end",
                        "marker-mid",
                        "marker-start",
                        "shape-rendering",
                        "stroke",
                        "stroke-dasharray",
                        "stroke-dashoffset",
                        "stroke-linecap",
                        "stroke-linejoin",
                        "stroke-miterlimit",
                        "stroke-opacity",
                        "stroke-width",
                        "text-rendering",
                        "baseline-shift",
                        "dominant-baseline",
                        "glyph-orientation-horizontal",
                        "glyph-orientation-vertical",
                        "text-anchor",
                        "writing-mode",
                    ],
                    d = t(u),
                    f = [
                        "scrollbar-arrow-color",
                        "scrollbar-base-color",
                        "scrollbar-dark-shadow-color",
                        "scrollbar-face-color",
                        "scrollbar-highlight-color",
                        "scrollbar-shadow-color",
                        "scrollbar-3d-light-color",
                        "scrollbar-track-color",
                        "shape-inside",
                        "searchfield-cancel-button",
                        "searchfield-decoration",
                        "searchfield-results-button",
                        "searchfield-results-decoration",
                        "zoom",
                    ],
                    h = t(f),
                    p = t([
                        "font-family",
                        "src",
                        "unicode-range",
                        "font-variant",
                        "font-feature-settings",
                        "font-stretch",
                        "font-weight",
                        "font-style",
                    ]),
                    m = t([
                        "additive-symbols",
                        "fallback",
                        "negative",
                        "pad",
                        "prefix",
                        "range",
                        "speak-as",
                        "suffix",
                        "symbols",
                        "system",
                    ]),
                    g = [
                        "aliceblue",
                        "antiquewhite",
                        "aqua",
                        "aquamarine",
                        "azure",
                        "beige",
                        "bisque",
                        "black",
                        "blanchedalmond",
                        "blue",
                        "blueviolet",
                        "brown",
                        "burlywood",
                        "cadetblue",
                        "chartreuse",
                        "chocolate",
                        "coral",
                        "cornflowerblue",
                        "cornsilk",
                        "crimson",
                        "cyan",
                        "darkblue",
                        "darkcyan",
                        "darkgoldenrod",
                        "darkgray",
                        "darkgreen",
                        "darkkhaki",
                        "darkmagenta",
                        "darkolivegreen",
                        "darkorange",
                        "darkorchid",
                        "darkred",
                        "darksalmon",
                        "darkseagreen",
                        "darkslateblue",
                        "darkslategray",
                        "darkturquoise",
                        "darkviolet",
                        "deeppink",
                        "deepskyblue",
                        "dimgray",
                        "dodgerblue",
                        "firebrick",
                        "floralwhite",
                        "forestgreen",
                        "fuchsia",
                        "gainsboro",
                        "ghostwhite",
                        "gold",
                        "goldenrod",
                        "gray",
                        "grey",
                        "green",
                        "greenyellow",
                        "honeydew",
                        "hotpink",
                        "indianred",
                        "indigo",
                        "ivory",
                        "khaki",
                        "lavender",
                        "lavenderblush",
                        "lawngreen",
                        "lemonchiffon",
                        "lightblue",
                        "lightcoral",
                        "lightcyan",
                        "lightgoldenrodyellow",
                        "lightgray",
                        "lightgreen",
                        "lightpink",
                        "lightsalmon",
                        "lightseagreen",
                        "lightskyblue",
                        "lightslategray",
                        "lightsteelblue",
                        "lightyellow",
                        "lime",
                        "limegreen",
                        "linen",
                        "magenta",
                        "maroon",
                        "mediumaquamarine",
                        "mediumblue",
                        "mediumorchid",
                        "mediumpurple",
                        "mediumseagreen",
                        "mediumslateblue",
                        "mediumspringgreen",
                        "mediumturquoise",
                        "mediumvioletred",
                        "midnightblue",
                        "mintcream",
                        "mistyrose",
                        "moccasin",
                        "navajowhite",
                        "navy",
                        "oldlace",
                        "olive",
                        "olivedrab",
                        "orange",
                        "orangered",
                        "orchid",
                        "palegoldenrod",
                        "palegreen",
                        "paleturquoise",
                        "palevioletred",
                        "papayawhip",
                        "peachpuff",
                        "peru",
                        "pink",
                        "plum",
                        "powderblue",
                        "purple",
                        "rebeccapurple",
                        "red",
                        "rosybrown",
                        "royalblue",
                        "saddlebrown",
                        "salmon",
                        "sandybrown",
                        "seagreen",
                        "seashell",
                        "sienna",
                        "silver",
                        "skyblue",
                        "slateblue",
                        "slategray",
                        "snow",
                        "springgreen",
                        "steelblue",
                        "tan",
                        "teal",
                        "thistle",
                        "tomato",
                        "turquoise",
                        "violet",
                        "wheat",
                        "white",
                        "whitesmoke",
                        "yellow",
                        "yellowgreen",
                    ],
                    v = t(g),
                    y = [
                        "above",
                        "absolute",
                        "activeborder",
                        "additive",
                        "activecaption",
                        "afar",
                        "after-white-space",
                        "ahead",
                        "alias",
                        "all",
                        "all-scroll",
                        "alphabetic",
                        "alternate",
                        "always",
                        "amharic",
                        "amharic-abegede",
                        "antialiased",
                        "appworkspace",
                        "arabic-indic",
                        "armenian",
                        "asterisks",
                        "attr",
                        "auto",
                        "auto-flow",
                        "avoid",
                        "avoid-column",
                        "avoid-page",
                        "avoid-region",
                        "background",
                        "backwards",
                        "baseline",
                        "below",
                        "bidi-override",
                        "binary",
                        "bengali",
                        "blink",
                        "block",
                        "block-axis",
                        "bold",
                        "bolder",
                        "border",
                        "border-box",
                        "both",
                        "bottom",
                        "break",
                        "break-all",
                        "break-word",
                        "bullets",
                        "button",
                        "button-bevel",
                        "buttonface",
                        "buttonhighlight",
                        "buttonshadow",
                        "buttontext",
                        "calc",
                        "cambodian",
                        "capitalize",
                        "caps-lock-indicator",
                        "caption",
                        "captiontext",
                        "caret",
                        "cell",
                        "center",
                        "checkbox",
                        "circle",
                        "cjk-decimal",
                        "cjk-earthly-branch",
                        "cjk-heavenly-stem",
                        "cjk-ideographic",
                        "clear",
                        "clip",
                        "close-quote",
                        "col-resize",
                        "collapse",
                        "color",
                        "color-burn",
                        "color-dodge",
                        "column",
                        "column-reverse",
                        "compact",
                        "condensed",
                        "contain",
                        "content",
                        "contents",
                        "content-box",
                        "context-menu",
                        "continuous",
                        "copy",
                        "counter",
                        "counters",
                        "cover",
                        "crop",
                        "cross",
                        "crosshair",
                        "currentcolor",
                        "cursive",
                        "cyclic",
                        "darken",
                        "dashed",
                        "decimal",
                        "decimal-leading-zero",
                        "default",
                        "default-button",
                        "dense",
                        "destination-atop",
                        "destination-in",
                        "destination-out",
                        "destination-over",
                        "devanagari",
                        "difference",
                        "disc",
                        "discard",
                        "disclosure-closed",
                        "disclosure-open",
                        "document",
                        "dot-dash",
                        "dot-dot-dash",
                        "dotted",
                        "double",
                        "down",
                        "e-resize",
                        "ease",
                        "ease-in",
                        "ease-in-out",
                        "ease-out",
                        "element",
                        "ellipse",
                        "ellipsis",
                        "embed",
                        "end",
                        "ethiopic",
                        "ethiopic-abegede",
                        "ethiopic-abegede-am-et",
                        "ethiopic-abegede-gez",
                        "ethiopic-abegede-ti-er",
                        "ethiopic-abegede-ti-et",
                        "ethiopic-halehame-aa-er",
                        "ethiopic-halehame-aa-et",
                        "ethiopic-halehame-am-et",
                        "ethiopic-halehame-gez",
                        "ethiopic-halehame-om-et",
                        "ethiopic-halehame-sid-et",
                        "ethiopic-halehame-so-et",
                        "ethiopic-halehame-ti-er",
                        "ethiopic-halehame-ti-et",
                        "ethiopic-halehame-tig",
                        "ethiopic-numeric",
                        "ew-resize",
                        "exclusion",
                        "expanded",
                        "extends",
                        "extra-condensed",
                        "extra-expanded",
                        "fantasy",
                        "fast",
                        "fill",
                        "fixed",
                        "flat",
                        "flex",
                        "flex-end",
                        "flex-start",
                        "footnotes",
                        "forwards",
                        "from",
                        "geometricPrecision",
                        "georgian",
                        "graytext",
                        "grid",
                        "groove",
                        "gujarati",
                        "gurmukhi",
                        "hand",
                        "hangul",
                        "hangul-consonant",
                        "hard-light",
                        "hebrew",
                        "help",
                        "hidden",
                        "hide",
                        "higher",
                        "highlight",
                        "highlighttext",
                        "hiragana",
                        "hiragana-iroha",
                        "horizontal",
                        "hsl",
                        "hsla",
                        "hue",
                        "icon",
                        "ignore",
                        "inactiveborder",
                        "inactivecaption",
                        "inactivecaptiontext",
                        "infinite",
                        "infobackground",
                        "infotext",
                        "inherit",
                        "initial",
                        "inline",
                        "inline-axis",
                        "inline-block",
                        "inline-flex",
                        "inline-grid",
                        "inline-table",
                        "inset",
                        "inside",
                        "intrinsic",
                        "invert",
                        "italic",
                        "japanese-formal",
                        "japanese-informal",
                        "justify",
                        "kannada",
                        "katakana",
                        "katakana-iroha",
                        "keep-all",
                        "khmer",
                        "korean-hangul-formal",
                        "korean-hanja-formal",
                        "korean-hanja-informal",
                        "landscape",
                        "lao",
                        "large",
                        "larger",
                        "left",
                        "level",
                        "lighter",
                        "lighten",
                        "line-through",
                        "linear",
                        "linear-gradient",
                        "lines",
                        "list-item",
                        "listbox",
                        "listitem",
                        "local",
                        "logical",
                        "loud",
                        "lower",
                        "lower-alpha",
                        "lower-armenian",
                        "lower-greek",
                        "lower-hexadecimal",
                        "lower-latin",
                        "lower-norwegian",
                        "lower-roman",
                        "lowercase",
                        "ltr",
                        "luminosity",
                        "malayalam",
                        "match",
                        "matrix",
                        "matrix3d",
                        "media-controls-background",
                        "media-current-time-display",
                        "media-fullscreen-button",
                        "media-mute-button",
                        "media-play-button",
                        "media-return-to-realtime-button",
                        "media-rewind-button",
                        "media-seek-back-button",
                        "media-seek-forward-button",
                        "media-slider",
                        "media-sliderthumb",
                        "media-time-remaining-display",
                        "media-volume-slider",
                        "media-volume-slider-container",
                        "media-volume-sliderthumb",
                        "medium",
                        "menu",
                        "menulist",
                        "menulist-button",
                        "menulist-text",
                        "menulist-textfield",
                        "menutext",
                        "message-box",
                        "middle",
                        "min-intrinsic",
                        "mix",
                        "mongolian",
                        "monospace",
                        "move",
                        "multiple",
                        "multiply",
                        "myanmar",
                        "n-resize",
                        "narrower",
                        "ne-resize",
                        "nesw-resize",
                        "no-close-quote",
                        "no-drop",
                        "no-open-quote",
                        "no-repeat",
                        "none",
                        "normal",
                        "not-allowed",
                        "nowrap",
                        "ns-resize",
                        "numbers",
                        "numeric",
                        "nw-resize",
                        "nwse-resize",
                        "oblique",
                        "octal",
                        "opacity",
                        "open-quote",
                        "optimizeLegibility",
                        "optimizeSpeed",
                        "oriya",
                        "oromo",
                        "outset",
                        "outside",
                        "outside-shape",
                        "overlay",
                        "overline",
                        "padding",
                        "padding-box",
                        "painted",
                        "page",
                        "paused",
                        "persian",
                        "perspective",
                        "plus-darker",
                        "plus-lighter",
                        "pointer",
                        "polygon",
                        "portrait",
                        "pre",
                        "pre-line",
                        "pre-wrap",
                        "preserve-3d",
                        "progress",
                        "push-button",
                        "radial-gradient",
                        "radio",
                        "read-only",
                        "read-write",
                        "read-write-plaintext-only",
                        "rectangle",
                        "region",
                        "relative",
                        "repeat",
                        "repeating-linear-gradient",
                        "repeating-radial-gradient",
                        "repeat-x",
                        "repeat-y",
                        "reset",
                        "reverse",
                        "rgb",
                        "rgba",
                        "ridge",
                        "right",
                        "rotate",
                        "rotate3d",
                        "rotateX",
                        "rotateY",
                        "rotateZ",
                        "round",
                        "row",
                        "row-resize",
                        "row-reverse",
                        "rtl",
                        "run-in",
                        "running",
                        "s-resize",
                        "sans-serif",
                        "saturation",
                        "scale",
                        "scale3d",
                        "scaleX",
                        "scaleY",
                        "scaleZ",
                        "screen",
                        "scroll",
                        "scrollbar",
                        "scroll-position",
                        "se-resize",
                        "searchfield",
                        "searchfield-cancel-button",
                        "searchfield-decoration",
                        "searchfield-results-button",
                        "searchfield-results-decoration",
                        "self-start",
                        "self-end",
                        "semi-condensed",
                        "semi-expanded",
                        "separate",
                        "serif",
                        "show",
                        "sidama",
                        "simp-chinese-formal",
                        "simp-chinese-informal",
                        "single",
                        "skew",
                        "skewX",
                        "skewY",
                        "skip-white-space",
                        "slide",
                        "slider-horizontal",
                        "slider-vertical",
                        "sliderthumb-horizontal",
                        "sliderthumb-vertical",
                        "slow",
                        "small",
                        "small-caps",
                        "small-caption",
                        "smaller",
                        "soft-light",
                        "solid",
                        "somali",
                        "source-atop",
                        "source-in",
                        "source-out",
                        "source-over",
                        "space",
                        "space-around",
                        "space-between",
                        "space-evenly",
                        "spell-out",
                        "square",
                        "square-button",
                        "start",
                        "static",
                        "status-bar",
                        "stretch",
                        "stroke",
                        "sub",
                        "subpixel-antialiased",
                        "super",
                        "sw-resize",
                        "symbolic",
                        "symbols",
                        "system-ui",
                        "table",
                        "table-caption",
                        "table-cell",
                        "table-column",
                        "table-column-group",
                        "table-footer-group",
                        "table-header-group",
                        "table-row",
                        "table-row-group",
                        "tamil",
                        "telugu",
                        "text",
                        "text-bottom",
                        "text-top",
                        "textarea",
                        "textfield",
                        "thai",
                        "thick",
                        "thin",
                        "threeddarkshadow",
                        "threedface",
                        "threedhighlight",
                        "threedlightshadow",
                        "threedshadow",
                        "tibetan",
                        "tigre",
                        "tigrinya-er",
                        "tigrinya-er-abegede",
                        "tigrinya-et",
                        "tigrinya-et-abegede",
                        "to",
                        "top",
                        "trad-chinese-formal",
                        "trad-chinese-informal",
                        "transform",
                        "translate",
                        "translate3d",
                        "translateX",
                        "translateY",
                        "translateZ",
                        "transparent",
                        "ultra-condensed",
                        "ultra-expanded",
                        "underline",
                        "unset",
                        "up",
                        "upper-alpha",
                        "upper-armenian",
                        "upper-greek",
                        "upper-hexadecimal",
                        "upper-latin",
                        "upper-norwegian",
                        "upper-roman",
                        "uppercase",
                        "urdu",
                        "url",
                        "var",
                        "vertical",
                        "vertical-text",
                        "visible",
                        "visibleFill",
                        "visiblePainted",
                        "visibleStroke",
                        "visual",
                        "w-resize",
                        "wait",
                        "wave",
                        "wider",
                        "window",
                        "windowframe",
                        "windowtext",
                        "words",
                        "wrap",
                        "wrap-reverse",
                        "x-large",
                        "x-small",
                        "xor",
                        "xx-large",
                        "xx-small",
                    ],
                    b = t(y),
                    w = r.concat(i).concat(a).concat(s).concat(u).concat(f).concat(g).concat(y);

                function x(e, t) {
                    for (var r, n = !1; null != (r = e.next());) {
                        if (n && "/" == r) {
                            t.tokenize = null;
                            break;
                        }
                        n = "*" == r;
                    }
                    return ["comment", "comment"];
                }
                e.registerHelper("hintWords", "css", w),
                    e.defineMIME("text/css", {
                        documentTypes: n,
                        mediaTypes: o,
                        mediaFeatures: l,
                        mediaValueKeywords: c,
                        propertyKeywords: d,
                        nonStandardPropertyKeywords: h,
                        fontProperties: p,
                        counterDescriptors: m,
                        colorKeywords: v,
                        valueKeywords: b,
                        tokenHooks: {
                            "/": function(e, t) {
                                return !!e.eat("*") && ((t.tokenize = x), x(e, t));
                            },
                        },
                        name: "css",
                    }),
                    e.defineMIME("text/x-scss", {
                        mediaTypes: o,
                        mediaFeatures: l,
                        mediaValueKeywords: c,
                        propertyKeywords: d,
                        nonStandardPropertyKeywords: h,
                        colorKeywords: v,
                        valueKeywords: b,
                        fontProperties: p,
                        allowNested: !0,
                        lineComment: "//",
                        tokenHooks: {
                            "/": function(e, t) {
                                return e.eat("/") ?
                                    (e.skipToEnd(), ["comment", "comment"]) :
                                    e.eat("*") ?
                                    ((t.tokenize = x), x(e, t)) :
                                    ["operator", "operator"];
                            },
                            ":": function(e) {
                                return !!e.match(/\s*\{/, !1) && [null, null];
                            },
                            "$": function(e) {
                                return (
                                    e.match(/^[\w-]+/),
                                    e.match(/^\s*:/, !1) ?
                                    ["variable-2", "variable-definition"] :
                                    ["variable-2", "variable"]
                                );
                            },
                            "#": function(e) {
                                return !!e.eat("{") && [null, "interpolation"];
                            },
                        },
                        name: "css",
                        helperType: "scss",
                    }),
                    e.defineMIME("text/x-less", {
                        mediaTypes: o,
                        mediaFeatures: l,
                        mediaValueKeywords: c,
                        propertyKeywords: d,
                        nonStandardPropertyKeywords: h,
                        colorKeywords: v,
                        valueKeywords: b,
                        fontProperties: p,
                        allowNested: !0,
                        lineComment: "//",
                        tokenHooks: {
                            "/": function(e, t) {
                                return e.eat("/") ?
                                    (e.skipToEnd(), ["comment", "comment"]) :
                                    e.eat("*") ?
                                    ((t.tokenize = x), x(e, t)) :
                                    ["operator", "operator"];
                            },
                            "@": function(e) {
                                return e.eat("{") ?
                                    [null, "interpolation"] :
                                    !e.match(
                                        /^(charset|document|font-face|import|(-(moz|ms|o|webkit)-)?keyframes|media|namespace|page|supports)\b/i, !1
                                    ) &&
                                    (e.eatWhile(/[\w\\\-]/),
                                        e.match(/^\s*:/, !1) ?
                                        ["variable-2", "variable-definition"] :
                                        ["variable-2", "variable"]);
                            },
                            "&": function() {
                                return ["atom", "atom"];
                            },
                        },
                        name: "css",
                        helperType: "less",
                    }),
                    e.defineMIME("text/x-gss", {
                        documentTypes: n,
                        mediaTypes: o,
                        mediaFeatures: l,
                        propertyKeywords: d,
                        nonStandardPropertyKeywords: h,
                        fontProperties: p,
                        counterDescriptors: m,
                        colorKeywords: v,
                        valueKeywords: b,
                        supportsAtComponent: !0,
                        tokenHooks: {
                            "/": function(e, t) {
                                return !!e.eat("*") && ((t.tokenize = x), x(e, t));
                            },
                        },
                        name: "css",
                        helperType: "gss",
                    });
            })(r(2));
        },
        function(e, t, r) {
            "use strict";
            Object.defineProperty(t, "__esModule", { value: !0 }),
                (t.fileHighlighter = t.simpleHighlighters = t.fullHighlighters = void 0);
            var n = (function() {
                    return function(e, t) {
                        if (Array.isArray(e)) return e;
                        if (Symbol.iterator in Object(e))
                            return (function(e, t) {
                                var r = [],
                                    n = !0,
                                    i = !1,
                                    o = void 0;
                                try {
                                    for (
                                        var a, l = e[Symbol.iterator](); !(n = (a = l.next()).done) && (r.push(a.value), !t || r.length !== t); n = !0
                                    );
                                } catch (e) {
                                    (i = !0), (o = e);
                                } finally {
                                    try {
                                        !n && l.return && l.return();
                                    } finally {
                                        if (i) throw o;
                                    }
                                }
                                return r;
                            })(e, t);
                        throw new TypeError("Invalid attempt to destructure non-iterable instance");
                    };
                })(),
                i = (c(r(5)), r(0)),
                o = c(r(94)),
                a = c(r(95)),
                l = c(r(96)),
                s = c(r(97));

            function c(e) {
                return e && e.__esModule ? e : { default: e };
            }
            var u = (0, o.default)(i.codeBlocks),
                d = (t.fullHighlighters = u
                    .filter(function(e) {
                        return Boolean(e.cm);
                    })
                    .map(function(e) {
                        return e.cm;
                    })),
                f =
                ((t.simpleHighlighters = u
                        .filter(function(e) {
                            return Boolean(e.hl);
                        })
                        .map(function(e) {
                            return e.hl;
                        })),
                    n(d, 1)[0]);
            (t.fileHighlighter = f), (0, a.default)(f), (0, l.default)(f), (0, s.default)(f);
        },
        function(e, t, r) {
            "use strict";
            Object.defineProperty(t, "__esModule", { value: !0 });
            t.default = function(e) {
                return e
                    .split(",")
                    .map(function(e) {
                        return parseInt(e, 10) - 1;
                    })
                    .sort(function(e, t) {
                        return e - t;
                    });
            };
        },
        function(e, t, r) {
            "use strict";
            Object.defineProperty(t, "__esModule", { value: !0 }), (t.openResults = t.closeResults = void 0);
            var n,
                i = r(1),
                o = (n = i) && n.__esModule ? n : { default: n };
            (t.closeResults = function(e) {
                (o.default.selectedIndex = -1), e.classList.add("hidden"), (e.innerHTML = "");
            }),
            (t.openResults = function(e, t) {
                (o.default.selectedIndex = -1), (e.innerHTML = t), e.classList.remove("hidden");
            });
        },
        function(e, t, r) {
            "use strict";
            Object.defineProperty(t, "__esModule", { value: !0 }), (t.default = window.esdocSearchIndex);
        },
        function(e, t, r) {
            "use strict";
            r(15);
            r(0);
            r(4),
                r(18),
                r(20),
                r(22),
                r(24),
                r(26),
                r(28),
                r(30),
                r(32),
                r(10),
                r(98),
                r(100),
                r(102),
                r(104),
                r(110),
                r(115),
                r(117),
                r(119),
                r(121),
                r(123),
                r(125),
                r(131),
                r(133),
                r(134);
        },
        function(e, t) {},
        function(e, t, r) {
            "use strict";
            Object.defineProperty(t, "__esModule", { value: !0 }), r(17);
            t.default = {
                name: "Open Dyslexic",
                key: "dyslexic",
                className: "dyslexic",
                css: "Open Dyslexic",
                file: "OpenDyslexic-*.woff",
                styles: ["400", "400i", "700", "700i"],
                keywords: ["accessible", "accessibility", "dyslexia", "dyslexic", "read", "easy", "kids"],
            };
        },
        function(e, t) {},
        function(e, t, r) {
            "use strict";
            r(19);
        },
        function(e, t) {},
        function(e, t, r) {
            "use strict";
            r(21);
        },
        function(e, t) {},
        function(e, t, r) {
            "use strict";
            r(23);
        },
        function(e, t) {},
        function(e, t, r) {
            "use strict";
            r(25);
        },
        function(e, t) {},
        function(e, t, r) {
            "use strict";
            r(27);
        },
        function(e, t) {},
        function(e, t, r) {
            "use strict";
            r(29);
        },
        function(e, t) {},
        function(e, t, r) {
            "use strict";
            r(31);
        },
        function(e, t) {},
        function(e, t, r) {
            "use strict";
            Object.defineProperty(t, "__esModule", { value: !0 }), (t.default = void 0), r(33);
            t.default = function e(t) {
                !(function(e, t) {
                    if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
                })(this, e);
            };
        },
        function(e, t) {},
        function(e, t, r) {
            (function(e) {
                "use strict";
                e.defineMode("shell", function() {
                        var e = {};

                        function t(t, r) {
                            for (var n = r.split(" "), i = 0; i < n.length; i++) e[n[i]] = t;
                        }

                        function r(e, t) {
                            var a = "(" == e ? ")" : "{" == e ? "}" : e;
                            return function(l, s) {
                                for (var c, u = !1; null != (c = l.next());) {
                                    if (c === a && !u) {
                                        s.tokens.shift();
                                        break;
                                    }
                                    if ("$" === c && !u && "'" !== e && l.peek() != a) {
                                        (u = !0), l.backUp(1), s.tokens.unshift(i);
                                        break;
                                    }
                                    if (!u && e !== a && c === e) return s.tokens.unshift(r(e, t)), o(l, s);
                                    if (!u && /['"]/.test(c) && !/['"]/.test(e)) {
                                        s.tokens.unshift(n(c, "string")), l.backUp(1);
                                        break;
                                    }
                                    u = !u && "\\" === c;
                                }
                                return t;
                            };
                        }

                        function n(e, t) {
                            return function(n, i) {
                                return (i.tokens[0] = r(e, t)), n.next(), o(n, i);
                            };
                        }
                        t("atom", "true false"),
                            t(
                                "keyword",
                                "if then do else elif while until for in esac fi fin fil done exit set unset export function"
                            ),
                            t(
                                "builtin",
                                "ab awk bash beep cat cc cd chown chmod chroot clear cp curl cut diff echo find gawk gcc get git grep hg kill killall ln ls make mkdir openssl mv nc node npm ping ps restart rm rmdir sed service sh shopt shred source sort sleep ssh start stop su sudo svn tee telnet top touch vi vim wall wc wget who write yes zsh"
                            );
                        var i = function(e, t) {
                            t.tokens.length > 1 && e.eat("$");
                            var n = e.next();
                            return /['"({]/.test(n) ?
                                ((t.tokens[0] = r(n, "(" == n ? "quote" : "{" == n ? "def" : "string")),
                                    o(e, t)) :
                                (/\d/.test(n) || e.eatWhile(/\w/), t.tokens.shift(), "def");
                        };

                        function o(t, n) {
                            return (
                                n.tokens[0] ||
                                function(t, n) {
                                    if (t.eatSpace()) return null;
                                    var a = t.sol(),
                                        l = t.next();
                                    if ("\\" === l) return t.next(), null;
                                    if ("'" === l || '"' === l || "`" === l)
                                        return n.tokens.unshift(r(l, "`" === l ? "quote" : "string")), o(t, n);
                                    if ("#" === l)
                                        return a && t.eat("!") ?
                                            (t.skipToEnd(), "meta") :
                                            (t.skipToEnd(), "comment");
                                    if ("$" === l) return n.tokens.unshift(i), o(t, n);
                                    if ("+" === l || "=" === l) return "operator";
                                    if ("-" === l) return t.eat("-"), t.eatWhile(/\w/), "attribute";
                                    if (/\d/.test(l) && (t.eatWhile(/\d/), t.eol() || !/\w/.test(t.peek())))
                                        return "number";
                                    t.eatWhile(/[\w-]/);
                                    var s = t.current();
                                    return "=" === t.peek() && /\w+/.test(s) ?
                                        "def" :
                                        e.hasOwnProperty(s) ?
                                        e[s] :
                                        null;
                                }
                            )(t, n);
                        }
                        return {
                            startState: function() {
                                return { tokens: [] };
                            },
                            token: function(e, t) {
                                return o(e, t);
                            },
                            closeBrackets: "()[]{}''\"\"``",
                            lineComment: "#",
                            fold: "brace",
                        };
                    }),
                    e.defineMIME("text/x-sh", "shell"),
                    e.defineMIME("application/x-sh", "shell");
            })(r(2));
        },
        function(e, t, r) {
            (function(e) {
                "use strict";
                var t = {
                    script: [
                        ["lang", /(javascript|babel)/i, "javascript"],
                        [
                            "type",
                            /^(?:text|application)\/(?:x-)?(?:java|ecma)script$|^module$|^$/i,
                            "javascript",
                        ],
                        ["type", /./, "text/plain"],
                        [null, null, "javascript"],
                    ],
                    style: [
                        ["lang", /^css$/i, "css"],
                        ["type", /^(text\/)?(x-)?(stylesheet|css)$/i, "css"],
                        ["type", /./, "text/plain"],
                        [null, null, "css"],
                    ],
                };
                var r = {};

                function n(e, t) {
                    var n = e.match(
                        (function(e) {
                            var t = r[e];
                            return (
                                t || (r[e] = new RegExp("\\s+" + e + "\\s*=\\s*('|\")?([^'\"]+)('|\")?\\s*"))
                            );
                        })(t)
                    );
                    return n ? /^\s*(.*?)\s*$/.exec(n[2])[1] : "";
                }

                function i(e, t) {
                    return new RegExp((t ? "^" : "") + "</s*" + e + "s*>", "i");
                }

                function o(e, t) {
                    for (var r in e)
                        for (var n = t[r] || (t[r] = []), i = e[r], o = i.length - 1; o >= 0; o--)
                            n.unshift(i[o]);
                }
                e.defineMode(
                        "htmlmixed",
                        function(r, a) {
                            var l = e.getMode(r, {
                                    name: "xml",
                                    htmlMode: !0,
                                    multilineTagIndentFactor: a.multilineTagIndentFactor,
                                    multilineTagIndentPastTag: a.multilineTagIndentPastTag,
                                }),
                                s = {},
                                c = a && a.tags,
                                u = a && a.scriptTypes;
                            if ((o(t, s), c && o(c, s), u))
                                for (var d = u.length - 1; d >= 0; d--)
                                    s.script.unshift(["type", u[d].matches, u[d].mode]);

                            function f(t, o) {
                                var a,
                                    c = l.token(t, o.htmlState),
                                    u = /\btag\b/.test(c);
                                if (
                                    u &&
                                    !/[<>\s\/]/.test(t.current()) &&
                                    (a = o.htmlState.tagName && o.htmlState.tagName.toLowerCase()) &&
                                    s.hasOwnProperty(a)
                                )
                                    o.inTag = a + " ";
                                else if (o.inTag && u && />$/.test(t.current())) {
                                    var d = /^([\S]+) (.*)/.exec(o.inTag);
                                    o.inTag = null;
                                    var h =
                                        ">" == t.current() &&
                                        (function(e, t) {
                                            for (var r = 0; r < e.length; r++) {
                                                var i = e[r];
                                                if (!i[0] || i[1].test(n(t, i[0]))) return i[2];
                                            }
                                        })(s[d[1]], d[2]),
                                        p = e.getMode(r, h),
                                        m = i(d[1], !0),
                                        g = i(d[1], !1);
                                    (o.token = function(e, t) {
                                        return e.match(m, !1) ?
                                            ((t.token = f), (t.localState = t.localMode = null), null) :
                                            (function(e, t, r) {
                                                var n = e.current(),
                                                    i = n.search(t);
                                                return (
                                                    i > -1 ?
                                                    e.backUp(n.length - i) :
                                                    n.match(/<\/?$/) &&
                                                    (e.backUp(n.length), e.match(t, !1) || e.match(n)),
                                                    r
                                                );
                                            })(e, g, t.localMode.token(e, t.localState));
                                    }),
                                    (o.localMode = p),
                                    (o.localState = e.startState(p, l.indent(o.htmlState, "")));
                                } else o.inTag && ((o.inTag += t.current()), t.eol() && (o.inTag += " "));
                                return c;
                            }
                            return {
                                startState: function() {
                                    return {
                                        token: f,
                                        inTag: null,
                                        localMode: null,
                                        localState: null,
                                        htmlState: e.startState(l),
                                    };
                                },
                                copyState: function(t) {
                                    var r;
                                    return (
                                        t.localState && (r = e.copyState(t.localMode, t.localState)), {
                                            token: t.token,
                                            inTag: t.inTag,
                                            localMode: t.localMode,
                                            localState: r,
                                            htmlState: e.copyState(l, t.htmlState),
                                        }
                                    );
                                },
                                token: function(e, t) {
                                    return t.token(e, t);
                                },
                                indent: function(t, r, n) {
                                    return !t.localMode || /^\s*<\//.test(r) ?
                                        l.indent(t.htmlState, r) :
                                        t.localMode.indent ?
                                        t.localMode.indent(t.localState, r, n) :
                                        e.Pass;
                                },
                                innerMode: function(e) {
                                    return { state: e.localState || e.htmlState, mode: e.localMode || l };
                                },
                            };
                        },
                        "xml",
                        "javascript",
                        "css"
                    ),
                    e.defineMIME("text/html", "htmlmixed");
            })(r(2), r(7), r(8), r(9));
        },
        function(e, t, r) {
            (function(e) {
                "use strict";

                function t(e, t, r, n) {
                    (this.state = e), (this.mode = t), (this.depth = r), (this.prev = n);
                }
                e.defineMode(
                        "jsx",
                        function(r, n) {
                            var i = e.getMode(r, {
                                    name: "xml",
                                    allowMissing: !0,
                                    multilineTagIndentPastTag: !1,
                                    allowMissingTagName: !0,
                                }),
                                o = e.getMode(r, (n && n.base) || "javascript");

                            function a(e) {
                                var t = e.tagName;
                                e.tagName = null;
                                var r = i.indent(e, "");
                                return (e.tagName = t), r;
                            }

                            function l(n, s) {
                                return s.context.mode == i ?
                                    (function(n, s, c) {
                                        if (2 == c.depth)
                                            return (
                                                n.match(/^.*?\*\//) ? (c.depth = 1) : n.skipToEnd(), "comment"
                                            );
                                        if ("{" == n.peek()) {
                                            i.skipAttribute(c.state);
                                            var u = a(c.state),
                                                d = c.state.context;
                                            if (d && n.match(/^[^>]*>\s*$/, !1)) {
                                                for (; d.prev && !d.startOfLine;) d = d.prev;
                                                d.startOfLine ?
                                                    (u -= r.indentUnit) :
                                                    c.prev.state.lexical &&
                                                    (u = c.prev.state.lexical.indented);
                                            } else 1 == c.depth && (u += r.indentUnit);
                                            return (
                                                (s.context = new t(e.startState(o, u), o, 0, s.context)), null
                                            );
                                        }
                                        if (1 == c.depth) {
                                            if ("<" == n.peek())
                                                return (
                                                    i.skipAttribute(c.state),
                                                    (s.context = new t(
                                                        e.startState(i, a(c.state)),
                                                        i,
                                                        0,
                                                        s.context
                                                    )),
                                                    null
                                                );
                                            if (n.match("//")) return n.skipToEnd(), "comment";
                                            if (n.match("/*")) return (c.depth = 2), l(n, s);
                                        }
                                        var f,
                                            h = i.token(n, c.state),
                                            p = n.current();
                                        /\btag\b/.test(h) ?
                                            />$/.test(p) ?
                                            c.state.context ?
                                            (c.depth = 0) :
                                            (s.context = s.context.prev) :
                                            /^</.test(p) && (c.depth = 1) :
                                            !h && (f = p.indexOf("{")) > -1 && n.backUp(p.length - f);
                                        return h;
                                    })(n, s, s.context) :
                                    (function(r, n, a) {
                                        if ("<" == r.peek() && o.expressionAllowed(r, a.state))
                                            return (
                                                o.skipExpression(a.state),
                                                (n.context = new t(
                                                    e.startState(i, o.indent(a.state, "")),
                                                    i,
                                                    0,
                                                    n.context
                                                )),
                                                null
                                            );
                                        var l = o.token(r, a.state);
                                        if (!l && null != a.depth) {
                                            var s = r.current();
                                            "{" == s
                                                ?
                                                a.depth++
                                                :
                                                "}" == s && 0 == --a.depth && (n.context = n.context.prev);
                                        }
                                        return l;
                                    })(n, s, s.context);
                            }
                            return {
                                startState: function() {
                                    return { context: new t(e.startState(o), o) };
                                },
                                copyState: function(r) {
                                    return {
                                        context: (function r(n) {
                                            return new t(
                                                e.copyState(n.mode, n.state),
                                                n.mode,
                                                n.depth,
                                                n.prev && r(n.prev)
                                            );
                                        })(r.context),
                                    };
                                },
                                token: l,
                                indent: function(e, t, r) {
                                    return e.context.mode.indent(e.context.state, t, r);
                                },
                                innerMode: function(e) {
                                    return e.context;
                                },
                            };
                        },
                        "xml",
                        "javascript"
                    ),
                    e.defineMIME("text/jsx", "jsx"),
                    e.defineMIME("text/typescript-jsx", {
                        name: "jsx",
                        base: { name: "javascript", typescript: !0 },
                    });
            })(r(2), r(7), r(8));
        },
        function(e, t, r) {
            (function(e) {
                "use strict";
                e.defineMode(
                        "sass",
                        function(t) {
                            var r = e.mimeModes["text/css"],
                                n = r.propertyKeywords || {},
                                i = r.colorKeywords || {},
                                o = r.valueKeywords || {},
                                a = r.fontProperties || {};
                            var l,
                                s = new RegExp("^" + ["true", "false", "null", "auto"].join("|")),
                                c = new RegExp(
                                    "^" + [
                                        "\\(",
                                        "\\)",
                                        "=",
                                        ">",
                                        "<",
                                        "==",
                                        ">=",
                                        "<=",
                                        "\\+",
                                        "-",
                                        "\\!=",
                                        "/",
                                        "\\*",
                                        "%",
                                        "and",
                                        "or",
                                        "not",
                                        ";",
                                        "\\{",
                                        "\\}",
                                        ":",
                                    ].join("|")
                                ),
                                u = /^::?[a-zA-Z_][\w\-]*/;

                            function d(e) {
                                return !e.peek() || e.match(/\s+$/, !1);
                            }

                            function f(e, t) {
                                var r = e.peek();
                                return ")" === r ?
                                    (e.next(), (t.tokenizer = y), "operator") :
                                    "(" === r ?
                                    (e.next(), e.eatSpace(), "operator") :
                                    "'" === r || '"' === r ?
                                    ((t.tokenizer = p(e.next())), "string") :
                                    ((t.tokenizer = p(")", !1)), "string");
                            }

                            function h(e, t) {
                                return function(r, n) {
                                    return r.sol() && r.indentation() <= e ?
                                        ((n.tokenizer = y), y(r, n)) :
                                        (t && r.skipTo("*/") ?
                                            (r.next(), r.next(), (n.tokenizer = y)) :
                                            r.skipToEnd(),
                                            "comment");
                                };
                            }

                            function p(e, t) {
                                return (
                                    null == t && (t = !0),
                                    function r(n, i) {
                                        var o = n.next(),
                                            a = n.peek(),
                                            l = n.string.charAt(n.pos - 2);
                                        return ("\\" !== o && a === e) || (o === e && "\\" !== l) ?
                                            (o !== e && t && n.next(),
                                                d(n) && (i.cursorHalf = 0),
                                                (i.tokenizer = y),
                                                "string") :
                                            "#" === o && "{" === a ?
                                            ((i.tokenizer = m(r)), n.next(), "operator") :
                                            "string";
                                    }
                                );
                            }

                            function m(e) {
                                return function(t, r) {
                                    return "}" === t.peek() ? (t.next(), (r.tokenizer = e), "operator") : y(t, r);
                                };
                            }

                            function g(e) {
                                if (0 == e.indentCount) {
                                    e.indentCount++;
                                    var r = e.scopes[0].offset + t.indentUnit;
                                    e.scopes.unshift({ offset: r });
                                }
                            }

                            function v(e) {
                                1 != e.scopes.length && e.scopes.shift();
                            }

                            function y(e, t) {
                                var r = e.peek();
                                if (e.match("/*"))
                                    return (t.tokenizer = h(e.indentation(), !0)), t.tokenizer(e, t);
                                if (e.match("//"))
                                    return (t.tokenizer = h(e.indentation(), !1)), t.tokenizer(e, t);
                                if (e.match("#{")) return (t.tokenizer = m(y)), "operator";
                                if ('"' === r || "'" === r) return e.next(), (t.tokenizer = p(r)), "string";
                                if (t.cursorHalf) {
                                    if ("#" === r && (e.next(), e.match(/[0-9a-fA-F]{6}|[0-9a-fA-F]{3}/)))
                                        return d(e) && (t.cursorHalf = 0), "number";
                                    if (e.match(/^-?[0-9\.]+/)) return d(e) && (t.cursorHalf = 0), "number";
                                    if (e.match(/^(px|em|in)\b/)) return d(e) && (t.cursorHalf = 0), "unit";
                                    if (e.match(s)) return d(e) && (t.cursorHalf = 0), "keyword";
                                    if (e.match(/^url/) && "(" === e.peek())
                                        return (t.tokenizer = f), d(e) && (t.cursorHalf = 0), "atom";
                                    if ("$" === r)
                                        return (
                                            e.next(),
                                            e.eatWhile(/[\w-]/),
                                            d(e) && (t.cursorHalf = 0),
                                            "variable-2"
                                        );
                                    if ("!" === r)
                                        return (
                                            e.next(),
                                            (t.cursorHalf = 0),
                                            e.match(/^[\w]+/) ? "keyword" : "operator"
                                        );
                                    if (e.match(c)) return d(e) && (t.cursorHalf = 0), "operator";
                                    if (e.eatWhile(/[\w-]/))
                                        return (
                                            d(e) && (t.cursorHalf = 0),
                                            (l = e.current().toLowerCase()),
                                            o.hasOwnProperty(l) ?
                                            "atom" :
                                            i.hasOwnProperty(l) ?
                                            "keyword" :
                                            n.hasOwnProperty(l) ?
                                            ((t.prevProp = e.current().toLowerCase()), "property") :
                                            "tag"
                                        );
                                    if (d(e)) return (t.cursorHalf = 0), null;
                                } else {
                                    if ("-" === r && e.match(/^-\w+-/)) return "meta";
                                    if ("." === r) {
                                        if ((e.next(), e.match(/^[\w-]+/))) return g(t), "qualifier";
                                        if ("#" === e.peek()) return g(t), "tag";
                                    }
                                    if ("#" === r) {
                                        if ((e.next(), e.match(/^[\w-]+/))) return g(t), "builtin";
                                        if ("#" === e.peek()) return g(t), "tag";
                                    }
                                    if ("$" === r) return e.next(), e.eatWhile(/[\w-]/), "variable-2";
                                    if (e.match(/^-?[0-9\.]+/)) return "number";
                                    if (e.match(/^(px|em|in)\b/)) return "unit";
                                    if (e.match(s)) return "keyword";
                                    if (e.match(/^url/) && "(" === e.peek()) return (t.tokenizer = f), "atom";
                                    if ("=" === r && e.match(/^=[\w-]+/)) return g(t), "meta";
                                    if ("+" === r && e.match(/^\+[\w-]+/)) return "variable-3";
                                    if (
                                        ("@" === r && e.match(/@extend/) && (e.match(/\s*[\w]/) || v(t)),
                                            e.match(/^@(else if|if|media|else|for|each|while|mixin|function)/))
                                    )
                                        return g(t), "def";
                                    if ("@" === r) return e.next(), e.eatWhile(/[\w-]/), "def";
                                    if (e.eatWhile(/[\w-]/)) {
                                        if (e.match(/ *: *[\w-\+\$#!\("']/, !1)) {
                                            l = e.current().toLowerCase();
                                            var b = t.prevProp + "-" + l;
                                            return n.hasOwnProperty(b) ?
                                                "property" :
                                                n.hasOwnProperty(l) ?
                                                ((t.prevProp = l), "property") :
                                                a.hasOwnProperty(l) ?
                                                "property" :
                                                "tag";
                                        }
                                        return e.match(/ *:/, !1) ?
                                            (g(t),
                                                (t.cursorHalf = 1),
                                                (t.prevProp = e.current().toLowerCase()),
                                                "property") :
                                            e.match(/ *,/, !1) ?
                                            "tag" :
                                            (g(t), "tag");
                                    }
                                    if (":" === r)
                                        return e.match(u) ?
                                            "variable-3" :
                                            (e.next(), (t.cursorHalf = 1), "operator");
                                }
                                return e.match(c) ? "operator" : (e.next(), null);
                            }
                            return {
                                startState: function() {
                                    return {
                                        tokenizer: y,
                                        scopes: [{ offset: 0, type: "sass" }],
                                        indentCount: 0,
                                        cursorHalf: 0,
                                        definedVars: [],
                                        definedMixins: [],
                                    };
                                },
                                token: function(e, r) {
                                    var n = (function(e, r) {
                                        e.sol() && (r.indentCount = 0);
                                        var n = r.tokenizer(e, r),
                                            i = e.current();
                                        if ((("@return" !== i && "}" !== i) || v(r), null !== n)) {
                                            for (
                                                var o = e.pos - i.length + t.indentUnit * r.indentCount,
                                                    a = [],
                                                    l = 0; l < r.scopes.length; l++
                                            ) {
                                                var s = r.scopes[l];
                                                s.offset <= o && a.push(s);
                                            }
                                            r.scopes = a;
                                        }
                                        return n;
                                    })(e, r);
                                    return (r.lastToken = { style: n, content: e.current() }), n;
                                },
                                indent: function(e) {
                                    return e.scopes[0].offset;
                                },
                            };
                        },
                        "css"
                    ),
                    e.defineMIME("text/x-sass", "sass");
            })(r(2), r(9));
        },
        function(e, t, r) {
            (function(e) {
                "use strict";
                e.defineMode("stylus", function(e) {
                    for (
                        var h,
                            g,
                            v,
                            y,
                            b = e.indentUnit,
                            w = "",
                            x = m(t),
                            k = /^(a|b|i|s|col|em)$/i,
                            C = m(o),
                            S = m(a),
                            L = m(c),
                            M = m(s),
                            T = m(r),
                            O = p(r),
                            A = m(i),
                            z = m(n),
                            N = m(l),
                            E = /^\s*([.]{2,3}|&&|\|\||\*\*|[?!=:]?=|[-+*\/%<>]=?|\?:|\~)/,
                            W = p(u),
                            P = m(d),
                            H = new RegExp(/^\-(moz|ms|o|webkit)-/i),
                            D = m(f),
                            I = "",
                            j = {}; w.length < b;

                    )
                        w += " ";

                    function F(e, t) {
                        for (var r, n = !1; null != (r = e.next());) {
                            if (n && "/" == r) {
                                t.tokenize = null;
                                break;
                            }
                            n = "*" == r;
                        }
                        return ["comment", "comment"];
                    }

                    function R(e) {
                        return function(t, r) {
                            for (var n, i = !1; null != (n = t.next());) {
                                if (n == e && !i) {
                                    ")" == e && t.backUp(1);
                                    break;
                                }
                                i = !i && "\\" == n;
                            }
                            return (n == e || (!i && ")" != e)) && (r.tokenize = null), ["string", "string"];
                        };
                    }

                    function _(e, t) {
                        return (
                            e.next(),
                            e.match(/\s*[\"\')]/, !1) ? (t.tokenize = null) : (t.tokenize = R(")")), [null, "("]
                        );
                    }

                    function B(e, t, r, n) {
                        (this.type = e),
                        (this.indent = t),
                        (this.prev = r),
                        (this.line = n || { firstWord: "", indent: 0 });
                    }

                    function $(e, t, r, n) {
                        return (
                            (n = n >= 0 ? n : b), (e.context = new B(r, t.indentation() + n, e.context)), r
                        );
                    }

                    function q(e, t) {
                        var r = e.context.indent - b;
                        return (
                            (t = t || !1),
                            (e.context = e.context.prev),
                            t && (e.context.indent = r),
                            e.context.type
                        );
                    }

                    function U(e, t, r, n) {
                        for (var i = n || 1; i > 0; i--) r.context = r.context.prev;
                        return (function(e, t, r) {
                            return j[r.context.type](e, t, r);
                        })(e, t, r);
                    }

                    function V(e) {
                        return e.toLowerCase() in x;
                    }

                    function K(e) {
                        return (e = e.toLowerCase()) in C || e in N;
                    }

                    function G(e) {
                        return e.toLowerCase() in P;
                    }

                    function X(e) {
                        return e.toLowerCase().match(H);
                    }

                    function Y(e) {
                        var t = e.toLowerCase(),
                            r = "variable-2";
                        return (
                            V(e) ?
                            (r = "tag") :
                            G(e) ?
                            (r = "block-keyword") :
                            K(e) ?
                            (r = "property") :
                            t in L || t in D ?
                            (r = "atom") :
                            "return" == t || t in M ?
                            (r = "keyword") :
                            e.match(/^[A-Z]/) && (r = "string"),
                            r
                        );
                    }

                    function Z(e, t) {
                        return (
                            (te(t) && ("{" == e || "]" == e || "hash" == e || "qualifier" == e)) ||
                            "block-mixin" == e
                        );
                    }

                    function Q(e, t) {
                        return "{" == e && t.match(/^\s*\$?[\w-]+/i, !1);
                    }

                    function J(e, t) {
                        return ":" == e && t.match(/^[a-z-]+/, !1);
                    }

                    function ee(e) {
                        return (
                            e.sol() ||
                            e.string.match(
                                new RegExp("^\\s*" + e.current().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"))
                            )
                        );
                    }

                    function te(e) {
                        return e.eol() || e.match(/^\s*$/, !1);
                    }

                    function re(e) {
                        var t = /^\s*[-_]*[a-z0-9]+[\w-]*/i,
                            r = "string" == typeof e ? e.match(t) : e.string.match(t);
                        return r ? r[0].replace(/^\s*/, "") : "";
                    }
                    return (
                        (j.block = function(e, t, r) {
                            if (("comment" == e && ee(t)) || ("," == e && te(t)) || "mixin" == e)
                                return $(r, t, "block", 0);
                            if (Q(e, t)) return $(r, t, "interpolation");
                            if (te(t) && "]" == e && !/^\s*(\.|#|:|\[|\*|&)/.test(t.string) && !V(re(t)))
                                return $(r, t, "block", 0);
                            if (Z(e, t)) return $(r, t, "block");
                            if ("}" == e && te(t)) return $(r, t, "block", 0);
                            if ("variable-name" == e)
                                return t.string.match(/^\s?\$[\w-\.\[\]\'\"]+$/) || G(re(t)) ?
                                    $(r, t, "variableName") :
                                    $(r, t, "variableName", 0);
                            if ("=" == e) return te(t) || G(re(t)) ? $(r, t, "block") : $(r, t, "block", 0);
                            if ("*" == e && (te(t) || t.match(/\s*(,|\.|#|\[|:|{)/, !1)))
                                return (y = "tag"), $(r, t, "block");
                            if (J(e, t)) return $(r, t, "pseudo");
                            if (/@(font-face|media|supports|(-moz-)?document)/.test(e))
                                return $(r, t, te(t) ? "block" : "atBlock");
                            if (/@(-(moz|ms|o|webkit)-)?keyframes$/.test(e)) return $(r, t, "keyframes");
                            if (/@extends?/.test(e)) return $(r, t, "extend", 0);
                            if (e && "@" == e.charAt(0))
                                return t.indentation() > 0 && K(t.current().slice(1)) ?
                                    ((y = "variable-2"), "block") :
                                    /(@import|@require|@charset)/.test(e) ?
                                    $(r, t, "block", 0) :
                                    $(r, t, "block");
                            if ("reference" == e && te(t)) return $(r, t, "block");
                            if ("(" == e) return $(r, t, "parens");
                            if ("vendor-prefixes" == e) return $(r, t, "vendorPrefixes");
                            if ("word" == e) {
                                var n = t.current();
                                if ("property" == (y = Y(n)))
                                    return ee(t) ? $(r, t, "block", 0) : ((y = "atom"), "block");
                                if ("tag" == y) {
                                    if (/embed|menu|pre|progress|sub|table/.test(n) && K(re(t)))
                                        return (y = "atom"), "block";
                                    if (t.string.match(new RegExp("\\[\\s*" + n + "|" + n + "\\s*\\]")))
                                        return (y = "atom"), "block";
                                    if (
                                        k.test(n) &&
                                        ((ee(t) && t.string.match(/=/)) ||
                                            (!ee(t) &&
                                                !t.string.match(/^(\s*\.|#|\&|\[|\/|>|\*)/) &&
                                                !V(re(t))))
                                    )
                                        return (y = "variable-2"), G(re(t)) ? "block" : $(r, t, "block", 0);
                                    if (te(t)) return $(r, t, "block");
                                }
                                if ("block-keyword" == y)
                                    return (
                                        (y = "keyword"),
                                        t.current(/(if|unless)/) && !ee(t) ? "block" : $(r, t, "block")
                                    );
                                if ("return" == n) return $(r, t, "block", 0);
                                if ("variable-2" == y && t.string.match(/^\s?\$[\w-\.\[\]\'\"]+$/))
                                    return $(r, t, "block");
                            }
                            return r.context.type;
                        }),
                        (j.parens = function(e, t, r) {
                            if ("(" == e) return $(r, t, "parens");
                            if (")" == e)
                                return "parens" == r.context.prev.type ?
                                    q(r) :
                                    (t.string.match(/^[a-z][\w-]*\(/i) && te(t)) ||
                                    G(re(t)) ||
                                    /(\.|#|:|\[|\*|&|>|~|\+|\/)/.test(re(t)) ||
                                    (!t.string.match(/^-?[a-z][\w-\.\[\]\'\"]*\s*=/) && V(re(t))) ?
                                    $(r, t, "block") :
                                    t.string.match(/^[\$-]?[a-z][\w-\.\[\]\'\"]*\s*=/) ||
                                    t.string.match(/^\s*(\(|\)|[0-9])/) ||
                                    t.string.match(/^\s+[a-z][\w-]*\(/i) ||
                                    t.string.match(/^\s+[\$-]?[a-z]/i) ?
                                    $(r, t, "block", 0) :
                                    te(t) ?
                                    $(r, t, "block") :
                                    $(r, t, "block", 0);
                            if (
                                (e && "@" == e.charAt(0) && K(t.current().slice(1)) && (y = "variable-2"),
                                    "word" == e)
                            ) {
                                var n = t.current();
                                "tag" == (y = Y(n)) && k.test(n) && (y = "variable-2"),
                                    ("property" != y && "to" != n) || (y = "atom");
                            }
                            return "variable-name" == e ?
                                $(r, t, "variableName") :
                                J(e, t) ?
                                $(r, t, "pseudo") :
                                r.context.type;
                        }),
                        (j.vendorPrefixes = function(e, t, r) {
                            return "word" == e ? ((y = "property"), $(r, t, "block", 0)) : q(r);
                        }),
                        (j.pseudo = function(e, t, r) {
                            return K(re(t.string)) ?
                                U(e, t, r) :
                                (t.match(/^[a-z-]+/), (y = "variable-3"), te(t) ? $(r, t, "block") : q(r));
                        }),
                        (j.atBlock = function(e, t, r) {
                            if ("(" == e) return $(r, t, "atBlock_parens");
                            if (Z(e, t)) return $(r, t, "block");
                            if (Q(e, t)) return $(r, t, "interpolation");
                            if ("word" == e) {
                                var n = t.current().toLowerCase();
                                if (
                                    "tag" ==
                                    (y = /^(only|not|and|or)$/.test(n) ?
                                        "keyword" :
                                        T.hasOwnProperty(n) ?
                                        "tag" :
                                        z.hasOwnProperty(n) ?
                                        "attribute" :
                                        A.hasOwnProperty(n) ?
                                        "property" :
                                        S.hasOwnProperty(n) ?
                                        "string-2" :
                                        Y(t.current())) &&
                                    te(t)
                                )
                                    return $(r, t, "block");
                            }
                            return (
                                "operator" == e && /^(not|and|or)$/.test(t.current()) && (y = "keyword"),
                                r.context.type
                            );
                        }),
                        (j.atBlock_parens = function(e, t, r) {
                            if ("{" == e || "}" == e) return r.context.type;
                            if (")" == e) return te(t) ? $(r, t, "block") : $(r, t, "atBlock");
                            if ("word" == e) {
                                var n = t.current().toLowerCase();
                                return (
                                    (y = Y(n)),
                                    /^(max|min)/.test(n) && (y = "property"),
                                    "tag" == y && (y = k.test(n) ? "variable-2" : "atom"),
                                    r.context.type
                                );
                            }
                            return j.atBlock(e, t, r);
                        }),
                        (j.keyframes = function(e, t, r) {
                            return "0" == t.indentation() &&
                                (("}" == e && ee(t)) ||
                                    "]" == e ||
                                    "hash" == e ||
                                    "qualifier" == e ||
                                    V(t.current())) ?
                                U(e, t, r) :
                                "{" == e ?
                                $(r, t, "keyframes") :
                                "}" == e ?
                                ee(t) ?
                                q(r, !0) :
                                $(r, t, "keyframes") :
                                "unit" == e && /^[0-9]+\%$/.test(t.current()) ?
                                $(r, t, "keyframes") :
                                "word" == e && "block-keyword" == (y = Y(t.current())) ?
                                ((y = "keyword"), $(r, t, "keyframes")) :
                                /@(font-face|media|supports|(-moz-)?document)/.test(e) ?
                                $(r, t, te(t) ? "block" : "atBlock") :
                                "mixin" == e ?
                                $(r, t, "block", 0) :
                                r.context.type;
                        }),
                        (j.interpolation = function(e, t, r) {
                            return (
                                "{" == e && q(r) && $(r, t, "block"),
                                "}" == e ?
                                t.string.match(/^\s*(\.|#|:|\[|\*|&|>|~|\+|\/)/i) ||
                                (t.string.match(/^\s*[a-z]/i) && V(re(t))) ?
                                $(r, t, "block") :
                                !t.string.match(/^(\{|\s*\&)/) || t.match(/\s*[\w-]/, !1) ?
                                $(r, t, "block", 0) :
                                $(r, t, "block") :
                                "variable-name" == e ?
                                $(r, t, "variableName", 0) :
                                ("word" == e && "tag" == (y = Y(t.current())) && (y = "atom"),
                                    r.context.type)
                            );
                        }),
                        (j.extend = function(e, t, r) {
                            return "[" == e || "=" == e ?
                                "extend" :
                                "]" == e ?
                                q(r) :
                                "word" == e ?
                                ((y = Y(t.current())), "extend") :
                                q(r);
                        }),
                        (j.variableName = function(e, t, r) {
                            return "string" == e || "[" == e || "]" == e || t.current().match(/^(\.|\$)/) ?
                                (t.current().match(/^\.[\w-]+/i) && (y = "variable-2"), "variableName") :
                                U(e, t, r);
                        }), {
                            startState: function(e) {
                                return {
                                    tokenize: null,
                                    state: "block",
                                    context: new B("block", e || 0, null),
                                };
                            },
                            token: function(e, t) {
                                return !t.tokenize && e.eatSpace() ?
                                    null :
                                    ((g = (
                                            t.tokenize ||
                                            function(e, t) {
                                                if (
                                                    ((I = e.string.match(
                                                            /(^[\w-]+\s*=\s*$)|(^\s*[\w-]+\s*=\s*[\w-])|(^\s*(\.|#|@|\$|\&|\[|\d|\+|::?|\{|\>|~|\/)?\s*[\w-]*([a-z0-9-]|\*|\/\*)(\(|,)?)/
                                                        )),
                                                        (t.context.line.firstWord = I ?
                                                            I[0].replace(/^\s*/, "") :
                                                            ""),
                                                        (t.context.line.indent = e.indentation()),
                                                        (h = e.peek()),
                                                        e.match("//"))
                                                )
                                                    return e.skipToEnd(), ["comment", "comment"];
                                                if (e.match("/*")) return (t.tokenize = F), F(e, t);
                                                if ('"' == h || "'" == h)
                                                    return e.next(), (t.tokenize = R(h)), t.tokenize(e, t);
                                                if ("@" == h)
                                                    return (
                                                        e.next(), e.eatWhile(/[\w\\-]/), ["def", e.current()]
                                                    );
                                                if ("#" == h) {
                                                    if (
                                                        (e.next(),
                                                            e.match(/^[0-9a-f]{3}([0-9a-f]([0-9a-f]{2}){0,2})?\b/i))
                                                    )
                                                        return ["atom", "atom"];
                                                    if (e.match(/^[a-z][\w-]*/i)) return ["builtin", "hash"];
                                                }
                                                return e.match(H) ?
                                                    ["meta", "vendor-prefixes"] :
                                                    e.match(/^-?[0-9]?\.?[0-9]/) ?
                                                    (e.eatWhile(/[a-z%]/i), ["number", "unit"]) :
                                                    "!" == h ?
                                                    (e.next(), [
                                                        e.match(/^(important|optional)/i) ?
                                                        "keyword" :
                                                        "operator",
                                                        "important",
                                                    ]) :
                                                    "." == h && e.match(/^\.[a-z][\w-]*/i) ?
                                                    ["qualifier", "qualifier"] :
                                                    e.match(O) ?
                                                    ("(" == e.peek() && (t.tokenize = _), ["property", "word"]) :
                                                    e.match(/^[a-z][\w-]*\(/i) ?
                                                    (e.backUp(1), ["keyword", "mixin"]) :
                                                    e.match(/^(\+|-)[a-z][\w-]*\(/i) ?
                                                    (e.backUp(1), ["keyword", "block-mixin"]) :
                                                    e.string.match(/^\s*&/) && e.match(/^[-_]+[a-z][\w-]*/) ?
                                                    ["qualifier", "qualifier"] :
                                                    e.match(/^(\/|&)(-|_|:|\.|#|[a-z])/) ?
                                                    (e.backUp(1), ["variable-3", "reference"]) :
                                                    e.match(/^&{1}\s*$/) ?
                                                    ["variable-3", "reference"] :
                                                    e.match(W) ?
                                                    ["operator", "operator"] :
                                                    e.match(/^\$?[-_]*[a-z0-9]+[\w-]*/i) ?
                                                    e.match(/^(\.|\[)[\w-\'\"\]]+/i, !1) && !V(e.current()) ?
                                                    (e.match(/\./), ["variable-2", "variable-name"]) :
                                                    ["variable-2", "word"] :
                                                    e.match(E) ?
                                                    ["operator", e.current()] :
                                                    /[:;,{}\[\]\(\)]/.test(h) ?
                                                    (e.next(), [null, h]) :
                                                    (e.next(), [null, null]);
                                            }
                                        )(e, t)) &&
                                        "object" == typeof g &&
                                        ((v = g[1]), (g = g[0])),
                                        (y = g),
                                        (t.state = j[t.state](v, e, t)),
                                        y);
                            },
                            indent: function(e, t, r) {
                                var n = e.context,
                                    i = t && t.charAt(0),
                                    o = n.indent,
                                    a = re(t),
                                    l = r.match(/^\s*/)[0].replace(/\t/g, w).length,
                                    s = e.context.prev ? e.context.prev.line.firstWord : "",
                                    c = e.context.prev ? e.context.prev.line.indent : l;
                                return (
                                    n.prev &&
                                    (("}" == i &&
                                            ("block" == n.type ||
                                                "atBlock" == n.type ||
                                                "keyframes" == n.type)) ||
                                        (")" == i && ("parens" == n.type || "atBlock_parens" == n.type)) ||
                                        ("{" == i && "at" == n.type)) ?
                                    (o = n.indent - b) :
                                    /(\})/.test(i) ||
                                    (/@|\$|\d/.test(i) ||
                                        /^\{/.test(t) ||
                                        /^\s*\/(\/|\*)/.test(t) ||
                                        /^\s*\/\*/.test(s) ||
                                        /^\s*[\w-\.\[\]\'\"]+\s*(\?|:|\+)?=/i.test(t) ||
                                        /^(\+|-)?[a-z][\w-]*\(/i.test(t) ||
                                        /^return/.test(t) ||
                                        G(a) ?
                                        (o = l) :
                                        /(\.|#|:|\[|\*|&|>|~|\+|\/)/.test(i) || V(a) ?
                                        (o = /\,\s*$/.test(s) ?
                                            c :
                                            /^\s+/.test(r) &&
                                            (/(\.|#|:|\[|\*|&|>|~|\+|\/)/.test(s) || V(s)) ?
                                            l <= c ?
                                            c :
                                            c + b :
                                            l) :
                                        /,\s*$/.test(r) ||
                                        (!X(a) && !K(a)) ||
                                        (o = G(s) ?
                                            l <= c ?
                                            c :
                                            c + b :
                                            /^\{/.test(s) ?
                                            l <= c ?
                                            l :
                                            c + b :
                                            X(s) || K(s) ?
                                            l >= c ?
                                            c :
                                            l :
                                            /^(\.|#|:|\[|\*|&|@|\+|\-|>|~|\/)/.test(s) ||
                                            /=\s*$/.test(s) ||
                                            V(s) ||
                                            /^\$[\w-\.\[\]\'\"]/.test(s) ?
                                            c + b :
                                            l)),
                                    o
                                );
                            },
                            electricChars: "}",
                            lineComment: "//",
                            fold: "indent",
                        }
                    );
                });
                var t = [
                        "a",
                        "abbr",
                        "address",
                        "area",
                        "article",
                        "aside",
                        "audio",
                        "b",
                        "base",
                        "bdi",
                        "bdo",
                        "bgsound",
                        "blockquote",
                        "body",
                        "br",
                        "button",
                        "canvas",
                        "caption",
                        "cite",
                        "code",
                        "col",
                        "colgroup",
                        "data",
                        "datalist",
                        "dd",
                        "del",
                        "details",
                        "dfn",
                        "div",
                        "dl",
                        "dt",
                        "em",
                        "embed",
                        "fieldset",
                        "figcaption",
                        "figure",
                        "footer",
                        "form",
                        "h1",
                        "h2",
                        "h3",
                        "h4",
                        "h5",
                        "h6",
                        "head",
                        "header",
                        "hgroup",
                        "hr",
                        "html",
                        "i",
                        "iframe",
                        "img",
                        "input",
                        "ins",
                        "kbd",
                        "keygen",
                        "label",
                        "legend",
                        "li",
                        "link",
                        "main",
                        "map",
                        "mark",
                        "marquee",
                        "menu",
                        "menuitem",
                        "meta",
                        "meter",
                        "nav",
                        "nobr",
                        "noframes",
                        "noscript",
                        "object",
                        "ol",
                        "optgroup",
                        "option",
                        "output",
                        "p",
                        "param",
                        "pre",
                        "progress",
                        "q",
                        "rp",
                        "rt",
                        "ruby",
                        "s",
                        "samp",
                        "script",
                        "section",
                        "select",
                        "small",
                        "source",
                        "span",
                        "strong",
                        "style",
                        "sub",
                        "summary",
                        "sup",
                        "table",
                        "tbody",
                        "td",
                        "textarea",
                        "tfoot",
                        "th",
                        "thead",
                        "time",
                        "tr",
                        "track",
                        "u",
                        "ul",
                        "var",
                        "video",
                    ],
                    r = ["domain", "regexp", "url", "url-prefix"],
                    n = [
                        "all",
                        "aural",
                        "braille",
                        "handheld",
                        "print",
                        "projection",
                        "screen",
                        "tty",
                        "tv",
                        "embossed",
                    ],
                    i = [
                        "width",
                        "min-width",
                        "max-width",
                        "height",
                        "min-height",
                        "max-height",
                        "device-width",
                        "min-device-width",
                        "max-device-width",
                        "device-height",
                        "min-device-height",
                        "max-device-height",
                        "aspect-ratio",
                        "min-aspect-ratio",
                        "max-aspect-ratio",
                        "device-aspect-ratio",
                        "min-device-aspect-ratio",
                        "max-device-aspect-ratio",
                        "color",
                        "min-color",
                        "max-color",
                        "color-index",
                        "min-color-index",
                        "max-color-index",
                        "monochrome",
                        "min-monochrome",
                        "max-monochrome",
                        "resolution",
                        "min-resolution",
                        "max-resolution",
                        "scan",
                        "grid",
                    ],
                    o = [
                        "align-content",
                        "align-items",
                        "align-self",
                        "alignment-adjust",
                        "alignment-baseline",
                        "anchor-point",
                        "animation",
                        "animation-delay",
                        "animation-direction",
                        "animation-duration",
                        "animation-fill-mode",
                        "animation-iteration-count",
                        "animation-name",
                        "animation-play-state",
                        "animation-timing-function",
                        "appearance",
                        "azimuth",
                        "backface-visibility",
                        "background",
                        "background-attachment",
                        "background-clip",
                        "background-color",
                        "background-image",
                        "background-origin",
                        "background-position",
                        "background-repeat",
                        "background-size",
                        "baseline-shift",
                        "binding",
                        "bleed",
                        "bookmark-label",
                        "bookmark-level",
                        "bookmark-state",
                        "bookmark-target",
                        "border",
                        "border-bottom",
                        "border-bottom-color",
                        "border-bottom-left-radius",
                        "border-bottom-right-radius",
                        "border-bottom-style",
                        "border-bottom-width",
                        "border-collapse",
                        "border-color",
                        "border-image",
                        "border-image-outset",
                        "border-image-repeat",
                        "border-image-slice",
                        "border-image-source",
                        "border-image-width",
                        "border-left",
                        "border-left-color",
                        "border-left-style",
                        "border-left-width",
                        "border-radius",
                        "border-right",
                        "border-right-color",
                        "border-right-style",
                        "border-right-width",
                        "border-spacing",
                        "border-style",
                        "border-top",
                        "border-top-color",
                        "border-top-left-radius",
                        "border-top-right-radius",
                        "border-top-style",
                        "border-top-width",
                        "border-width",
                        "bottom",
                        "box-decoration-break",
                        "box-shadow",
                        "box-sizing",
                        "break-after",
                        "break-before",
                        "break-inside",
                        "caption-side",
                        "clear",
                        "clip",
                        "color",
                        "color-profile",
                        "column-count",
                        "column-fill",
                        "column-gap",
                        "column-rule",
                        "column-rule-color",
                        "column-rule-style",
                        "column-rule-width",
                        "column-span",
                        "column-width",
                        "columns",
                        "content",
                        "counter-increment",
                        "counter-reset",
                        "crop",
                        "cue",
                        "cue-after",
                        "cue-before",
                        "cursor",
                        "direction",
                        "display",
                        "dominant-baseline",
                        "drop-initial-after-adjust",
                        "drop-initial-after-align",
                        "drop-initial-before-adjust",
                        "drop-initial-before-align",
                        "drop-initial-size",
                        "drop-initial-value",
                        "elevation",
                        "empty-cells",
                        "fit",
                        "fit-position",
                        "flex",
                        "flex-basis",
                        "flex-direction",
                        "flex-flow",
                        "flex-grow",
                        "flex-shrink",
                        "flex-wrap",
                        "float",
                        "float-offset",
                        "flow-from",
                        "flow-into",
                        "font",
                        "font-feature-settings",
                        "font-family",
                        "font-kerning",
                        "font-language-override",
                        "font-size",
                        "font-size-adjust",
                        "font-stretch",
                        "font-style",
                        "font-synthesis",
                        "font-variant",
                        "font-variant-alternates",
                        "font-variant-caps",
                        "font-variant-east-asian",
                        "font-variant-ligatures",
                        "font-variant-numeric",
                        "font-variant-position",
                        "font-weight",
                        "grid",
                        "grid-area",
                        "grid-auto-columns",
                        "grid-auto-flow",
                        "grid-auto-position",
                        "grid-auto-rows",
                        "grid-column",
                        "grid-column-end",
                        "grid-column-start",
                        "grid-row",
                        "grid-row-end",
                        "grid-row-start",
                        "grid-template",
                        "grid-template-areas",
                        "grid-template-columns",
                        "grid-template-rows",
                        "hanging-punctuation",
                        "height",
                        "hyphens",
                        "icon",
                        "image-orientation",
                        "image-rendering",
                        "image-resolution",
                        "inline-box-align",
                        "justify-content",
                        "left",
                        "letter-spacing",
                        "line-break",
                        "line-height",
                        "line-stacking",
                        "line-stacking-ruby",
                        "line-stacking-shift",
                        "line-stacking-strategy",
                        "list-style",
                        "list-style-image",
                        "list-style-position",
                        "list-style-type",
                        "margin",
                        "margin-bottom",
                        "margin-left",
                        "margin-right",
                        "margin-top",
                        "marker-offset",
                        "marks",
                        "marquee-direction",
                        "marquee-loop",
                        "marquee-play-count",
                        "marquee-speed",
                        "marquee-style",
                        "max-height",
                        "max-width",
                        "min-height",
                        "min-width",
                        "move-to",
                        "nav-down",
                        "nav-index",
                        "nav-left",
                        "nav-right",
                        "nav-up",
                        "object-fit",
                        "object-position",
                        "opacity",
                        "order",
                        "orphans",
                        "outline",
                        "outline-color",
                        "outline-offset",
                        "outline-style",
                        "outline-width",
                        "overflow",
                        "overflow-style",
                        "overflow-wrap",
                        "overflow-x",
                        "overflow-y",
                        "padding",
                        "padding-bottom",
                        "padding-left",
                        "padding-right",
                        "padding-top",
                        "page",
                        "page-break-after",
                        "page-break-before",
                        "page-break-inside",
                        "page-policy",
                        "pause",
                        "pause-after",
                        "pause-before",
                        "perspective",
                        "perspective-origin",
                        "pitch",
                        "pitch-range",
                        "play-during",
                        "position",
                        "presentation-level",
                        "punctuation-trim",
                        "quotes",
                        "region-break-after",
                        "region-break-before",
                        "region-break-inside",
                        "region-fragment",
                        "rendering-intent",
                        "resize",
                        "rest",
                        "rest-after",
                        "rest-before",
                        "richness",
                        "right",
                        "rotation",
                        "rotation-point",
                        "ruby-align",
                        "ruby-overhang",
                        "ruby-position",
                        "ruby-span",
                        "shape-image-threshold",
                        "shape-inside",
                        "shape-margin",
                        "shape-outside",
                        "size",
                        "speak",
                        "speak-as",
                        "speak-header",
                        "speak-numeral",
                        "speak-punctuation",
                        "speech-rate",
                        "stress",
                        "string-set",
                        "tab-size",
                        "table-layout",
                        "target",
                        "target-name",
                        "target-new",
                        "target-position",
                        "text-align",
                        "text-align-last",
                        "text-decoration",
                        "text-decoration-color",
                        "text-decoration-line",
                        "text-decoration-skip",
                        "text-decoration-style",
                        "text-emphasis",
                        "text-emphasis-color",
                        "text-emphasis-position",
                        "text-emphasis-style",
                        "text-height",
                        "text-indent",
                        "text-justify",
                        "text-outline",
                        "text-overflow",
                        "text-shadow",
                        "text-size-adjust",
                        "text-space-collapse",
                        "text-transform",
                        "text-underline-position",
                        "text-wrap",
                        "top",
                        "transform",
                        "transform-origin",
                        "transform-style",
                        "transition",
                        "transition-delay",
                        "transition-duration",
                        "transition-property",
                        "transition-timing-function",
                        "unicode-bidi",
                        "vertical-align",
                        "visibility",
                        "voice-balance",
                        "voice-duration",
                        "voice-family",
                        "voice-pitch",
                        "voice-range",
                        "voice-rate",
                        "voice-stress",
                        "voice-volume",
                        "volume",
                        "white-space",
                        "widows",
                        "width",
                        "will-change",
                        "word-break",
                        "word-spacing",
                        "word-wrap",
                        "z-index",
                        "clip-path",
                        "clip-rule",
                        "mask",
                        "enable-background",
                        "filter",
                        "flood-color",
                        "flood-opacity",
                        "lighting-color",
                        "stop-color",
                        "stop-opacity",
                        "pointer-events",
                        "color-interpolation",
                        "color-interpolation-filters",
                        "color-rendering",
                        "fill",
                        "fill-opacity",
                        "fill-rule",
                        "image-rendering",
                        "marker",
                        "marker-end",
                        "marker-mid",
                        "marker-start",
                        "shape-rendering",
                        "stroke",
                        "stroke-dasharray",
                        "stroke-dashoffset",
                        "stroke-linecap",
                        "stroke-linejoin",
                        "stroke-miterlimit",
                        "stroke-opacity",
                        "stroke-width",
                        "text-rendering",
                        "baseline-shift",
                        "dominant-baseline",
                        "glyph-orientation-horizontal",
                        "glyph-orientation-vertical",
                        "text-anchor",
                        "writing-mode",
                        "font-smoothing",
                        "osx-font-smoothing",
                    ],
                    a = [
                        "scrollbar-arrow-color",
                        "scrollbar-base-color",
                        "scrollbar-dark-shadow-color",
                        "scrollbar-face-color",
                        "scrollbar-highlight-color",
                        "scrollbar-shadow-color",
                        "scrollbar-3d-light-color",
                        "scrollbar-track-color",
                        "shape-inside",
                        "searchfield-cancel-button",
                        "searchfield-decoration",
                        "searchfield-results-button",
                        "searchfield-results-decoration",
                        "zoom",
                    ],
                    l = [
                        "font-family",
                        "src",
                        "unicode-range",
                        "font-variant",
                        "font-feature-settings",
                        "font-stretch",
                        "font-weight",
                        "font-style",
                    ],
                    s = [
                        "aliceblue",
                        "antiquewhite",
                        "aqua",
                        "aquamarine",
                        "azure",
                        "beige",
                        "bisque",
                        "black",
                        "blanchedalmond",
                        "blue",
                        "blueviolet",
                        "brown",
                        "burlywood",
                        "cadetblue",
                        "chartreuse",
                        "chocolate",
                        "coral",
                        "cornflowerblue",
                        "cornsilk",
                        "crimson",
                        "cyan",
                        "darkblue",
                        "darkcyan",
                        "darkgoldenrod",
                        "darkgray",
                        "darkgreen",
                        "darkkhaki",
                        "darkmagenta",
                        "darkolivegreen",
                        "darkorange",
                        "darkorchid",
                        "darkred",
                        "darksalmon",
                        "darkseagreen",
                        "darkslateblue",
                        "darkslategray",
                        "darkturquoise",
                        "darkviolet",
                        "deeppink",
                        "deepskyblue",
                        "dimgray",
                        "dodgerblue",
                        "firebrick",
                        "floralwhite",
                        "forestgreen",
                        "fuchsia",
                        "gainsboro",
                        "ghostwhite",
                        "gold",
                        "goldenrod",
                        "gray",
                        "grey",
                        "green",
                        "greenyellow",
                        "honeydew",
                        "hotpink",
                        "indianred",
                        "indigo",
                        "ivory",
                        "khaki",
                        "lavender",
                        "lavenderblush",
                        "lawngreen",
                        "lemonchiffon",
                        "lightblue",
                        "lightcoral",
                        "lightcyan",
                        "lightgoldenrodyellow",
                        "lightgray",
                        "lightgreen",
                        "lightpink",
                        "lightsalmon",
                        "lightseagreen",
                        "lightskyblue",
                        "lightslategray",
                        "lightsteelblue",
                        "lightyellow",
                        "lime",
                        "limegreen",
                        "linen",
                        "magenta",
                        "maroon",
                        "mediumaquamarine",
                        "mediumblue",
                        "mediumorchid",
                        "mediumpurple",
                        "mediumseagreen",
                        "mediumslateblue",
                        "mediumspringgreen",
                        "mediumturquoise",
                        "mediumvioletred",
                        "midnightblue",
                        "mintcream",
                        "mistyrose",
                        "moccasin",
                        "navajowhite",
                        "navy",
                        "oldlace",
                        "olive",
                        "olivedrab",
                        "orange",
                        "orangered",
                        "orchid",
                        "palegoldenrod",
                        "palegreen",
                        "paleturquoise",
                        "palevioletred",
                        "papayawhip",
                        "peachpuff",
                        "peru",
                        "pink",
                        "plum",
                        "powderblue",
                        "purple",
                        "rebeccapurple",
                        "red",
                        "rosybrown",
                        "royalblue",
                        "saddlebrown",
                        "salmon",
                        "sandybrown",
                        "seagreen",
                        "seashell",
                        "sienna",
                        "silver",
                        "skyblue",
                        "slateblue",
                        "slategray",
                        "snow",
                        "springgreen",
                        "steelblue",
                        "tan",
                        "teal",
                        "thistle",
                        "tomato",
                        "turquoise",
                        "violet",
                        "wheat",
                        "white",
                        "whitesmoke",
                        "yellow",
                        "yellowgreen",
                    ],
                    c = [
                        "above",
                        "absolute",
                        "activeborder",
                        "additive",
                        "activecaption",
                        "afar",
                        "after-white-space",
                        "ahead",
                        "alias",
                        "all",
                        "all-scroll",
                        "alphabetic",
                        "alternate",
                        "always",
                        "amharic",
                        "amharic-abegede",
                        "antialiased",
                        "appworkspace",
                        "arabic-indic",
                        "armenian",
                        "asterisks",
                        "attr",
                        "auto",
                        "avoid",
                        "avoid-column",
                        "avoid-page",
                        "avoid-region",
                        "background",
                        "backwards",
                        "baseline",
                        "below",
                        "bidi-override",
                        "binary",
                        "bengali",
                        "blink",
                        "block",
                        "block-axis",
                        "bold",
                        "bolder",
                        "border",
                        "border-box",
                        "both",
                        "bottom",
                        "break",
                        "break-all",
                        "break-word",
                        "bullets",
                        "button",
                        "button-bevel",
                        "buttonface",
                        "buttonhighlight",
                        "buttonshadow",
                        "buttontext",
                        "calc",
                        "cambodian",
                        "capitalize",
                        "caps-lock-indicator",
                        "caption",
                        "captiontext",
                        "caret",
                        "cell",
                        "center",
                        "checkbox",
                        "circle",
                        "cjk-decimal",
                        "cjk-earthly-branch",
                        "cjk-heavenly-stem",
                        "cjk-ideographic",
                        "clear",
                        "clip",
                        "close-quote",
                        "col-resize",
                        "collapse",
                        "column",
                        "compact",
                        "condensed",
                        "contain",
                        "content",
                        "contents",
                        "content-box",
                        "context-menu",
                        "continuous",
                        "copy",
                        "counter",
                        "counters",
                        "cover",
                        "crop",
                        "cross",
                        "crosshair",
                        "currentcolor",
                        "cursive",
                        "cyclic",
                        "dashed",
                        "decimal",
                        "decimal-leading-zero",
                        "default",
                        "default-button",
                        "destination-atop",
                        "destination-in",
                        "destination-out",
                        "destination-over",
                        "devanagari",
                        "disc",
                        "discard",
                        "disclosure-closed",
                        "disclosure-open",
                        "document",
                        "dot-dash",
                        "dot-dot-dash",
                        "dotted",
                        "double",
                        "down",
                        "e-resize",
                        "ease",
                        "ease-in",
                        "ease-in-out",
                        "ease-out",
                        "element",
                        "ellipse",
                        "ellipsis",
                        "embed",
                        "end",
                        "ethiopic",
                        "ethiopic-abegede",
                        "ethiopic-abegede-am-et",
                        "ethiopic-abegede-gez",
                        "ethiopic-abegede-ti-er",
                        "ethiopic-abegede-ti-et",
                        "ethiopic-halehame-aa-er",
                        "ethiopic-halehame-aa-et",
                        "ethiopic-halehame-am-et",
                        "ethiopic-halehame-gez",
                        "ethiopic-halehame-om-et",
                        "ethiopic-halehame-sid-et",
                        "ethiopic-halehame-so-et",
                        "ethiopic-halehame-ti-er",
                        "ethiopic-halehame-ti-et",
                        "ethiopic-halehame-tig",
                        "ethiopic-numeric",
                        "ew-resize",
                        "expanded",
                        "extends",
                        "extra-condensed",
                        "extra-expanded",
                        "fantasy",
                        "fast",
                        "fill",
                        "fixed",
                        "flat",
                        "flex",
                        "footnotes",
                        "forwards",
                        "from",
                        "geometricPrecision",
                        "georgian",
                        "graytext",
                        "groove",
                        "gujarati",
                        "gurmukhi",
                        "hand",
                        "hangul",
                        "hangul-consonant",
                        "hebrew",
                        "help",
                        "hidden",
                        "hide",
                        "higher",
                        "highlight",
                        "highlighttext",
                        "hiragana",
                        "hiragana-iroha",
                        "horizontal",
                        "hsl",
                        "hsla",
                        "icon",
                        "ignore",
                        "inactiveborder",
                        "inactivecaption",
                        "inactivecaptiontext",
                        "infinite",
                        "infobackground",
                        "infotext",
                        "inherit",
                        "initial",
                        "inline",
                        "inline-axis",
                        "inline-block",
                        "inline-flex",
                        "inline-table",
                        "inset",
                        "inside",
                        "intrinsic",
                        "invert",
                        "italic",
                        "japanese-formal",
                        "japanese-informal",
                        "justify",
                        "kannada",
                        "katakana",
                        "katakana-iroha",
                        "keep-all",
                        "khmer",
                        "korean-hangul-formal",
                        "korean-hanja-formal",
                        "korean-hanja-informal",
                        "landscape",
                        "lao",
                        "large",
                        "larger",
                        "left",
                        "level",
                        "lighter",
                        "line-through",
                        "linear",
                        "linear-gradient",
                        "lines",
                        "list-item",
                        "listbox",
                        "listitem",
                        "local",
                        "logical",
                        "loud",
                        "lower",
                        "lower-alpha",
                        "lower-armenian",
                        "lower-greek",
                        "lower-hexadecimal",
                        "lower-latin",
                        "lower-norwegian",
                        "lower-roman",
                        "lowercase",
                        "ltr",
                        "malayalam",
                        "match",
                        "matrix",
                        "matrix3d",
                        "media-controls-background",
                        "media-current-time-display",
                        "media-fullscreen-button",
                        "media-mute-button",
                        "media-play-button",
                        "media-return-to-realtime-button",
                        "media-rewind-button",
                        "media-seek-back-button",
                        "media-seek-forward-button",
                        "media-slider",
                        "media-sliderthumb",
                        "media-time-remaining-display",
                        "media-volume-slider",
                        "media-volume-slider-container",
                        "media-volume-sliderthumb",
                        "medium",
                        "menu",
                        "menulist",
                        "menulist-button",
                        "menulist-text",
                        "menulist-textfield",
                        "menutext",
                        "message-box",
                        "middle",
                        "min-intrinsic",
                        "mix",
                        "mongolian",
                        "monospace",
                        "move",
                        "multiple",
                        "myanmar",
                        "n-resize",
                        "narrower",
                        "ne-resize",
                        "nesw-resize",
                        "no-close-quote",
                        "no-drop",
                        "no-open-quote",
                        "no-repeat",
                        "none",
                        "normal",
                        "not-allowed",
                        "nowrap",
                        "ns-resize",
                        "numbers",
                        "numeric",
                        "nw-resize",
                        "nwse-resize",
                        "oblique",
                        "octal",
                        "open-quote",
                        "optimizeLegibility",
                        "optimizeSpeed",
                        "oriya",
                        "oromo",
                        "outset",
                        "outside",
                        "outside-shape",
                        "overlay",
                        "overline",
                        "padding",
                        "padding-box",
                        "painted",
                        "page",
                        "paused",
                        "persian",
                        "perspective",
                        "plus-darker",
                        "plus-lighter",
                        "pointer",
                        "polygon",
                        "portrait",
                        "pre",
                        "pre-line",
                        "pre-wrap",
                        "preserve-3d",
                        "progress",
                        "push-button",
                        "radial-gradient",
                        "radio",
                        "read-only",
                        "read-write",
                        "read-write-plaintext-only",
                        "rectangle",
                        "region",
                        "relative",
                        "repeat",
                        "repeating-linear-gradient",
                        "repeating-radial-gradient",
                        "repeat-x",
                        "repeat-y",
                        "reset",
                        "reverse",
                        "rgb",
                        "rgba",
                        "ridge",
                        "right",
                        "rotate",
                        "rotate3d",
                        "rotateX",
                        "rotateY",
                        "rotateZ",
                        "round",
                        "row-resize",
                        "rtl",
                        "run-in",
                        "running",
                        "s-resize",
                        "sans-serif",
                        "scale",
                        "scale3d",
                        "scaleX",
                        "scaleY",
                        "scaleZ",
                        "scroll",
                        "scrollbar",
                        "scroll-position",
                        "se-resize",
                        "searchfield",
                        "searchfield-cancel-button",
                        "searchfield-decoration",
                        "searchfield-results-button",
                        "searchfield-results-decoration",
                        "semi-condensed",
                        "semi-expanded",
                        "separate",
                        "serif",
                        "show",
                        "sidama",
                        "simp-chinese-formal",
                        "simp-chinese-informal",
                        "single",
                        "skew",
                        "skewX",
                        "skewY",
                        "skip-white-space",
                        "slide",
                        "slider-horizontal",
                        "slider-vertical",
                        "sliderthumb-horizontal",
                        "sliderthumb-vertical",
                        "slow",
                        "small",
                        "small-caps",
                        "small-caption",
                        "smaller",
                        "solid",
                        "somali",
                        "source-atop",
                        "source-in",
                        "source-out",
                        "source-over",
                        "space",
                        "spell-out",
                        "square",
                        "square-button",
                        "start",
                        "static",
                        "status-bar",
                        "stretch",
                        "stroke",
                        "sub",
                        "subpixel-antialiased",
                        "super",
                        "sw-resize",
                        "symbolic",
                        "symbols",
                        "table",
                        "table-caption",
                        "table-cell",
                        "table-column",
                        "table-column-group",
                        "table-footer-group",
                        "table-header-group",
                        "table-row",
                        "table-row-group",
                        "tamil",
                        "telugu",
                        "text",
                        "text-bottom",
                        "text-top",
                        "textarea",
                        "textfield",
                        "thai",
                        "thick",
                        "thin",
                        "threeddarkshadow",
                        "threedface",
                        "threedhighlight",
                        "threedlightshadow",
                        "threedshadow",
                        "tibetan",
                        "tigre",
                        "tigrinya-er",
                        "tigrinya-er-abegede",
                        "tigrinya-et",
                        "tigrinya-et-abegede",
                        "to",
                        "top",
                        "trad-chinese-formal",
                        "trad-chinese-informal",
                        "translate",
                        "translate3d",
                        "translateX",
                        "translateY",
                        "translateZ",
                        "transparent",
                        "ultra-condensed",
                        "ultra-expanded",
                        "underline",
                        "up",
                        "upper-alpha",
                        "upper-armenian",
                        "upper-greek",
                        "upper-hexadecimal",
                        "upper-latin",
                        "upper-norwegian",
                        "upper-roman",
                        "uppercase",
                        "urdu",
                        "url",
                        "var",
                        "vertical",
                        "vertical-text",
                        "visible",
                        "visibleFill",
                        "visiblePainted",
                        "visibleStroke",
                        "visual",
                        "w-resize",
                        "wait",
                        "wave",
                        "wider",
                        "window",
                        "windowframe",
                        "windowtext",
                        "words",
                        "x-large",
                        "x-small",
                        "xor",
                        "xx-large",
                        "xx-small",
                        "bicubic",
                        "optimizespeed",
                        "grayscale",
                        "row",
                        "row-reverse",
                        "wrap",
                        "wrap-reverse",
                        "column-reverse",
                        "flex-start",
                        "flex-end",
                        "space-between",
                        "space-around",
                        "unset",
                    ],
                    u = ["in", "and", "or", "not", "is not", "is a", "is", "isnt", "defined", "if unless"],
                    d = ["for", "if", "else", "unless", "from", "to"],
                    f = [
                        "null",
                        "true",
                        "false",
                        "href",
                        "title",
                        "type",
                        "not-allowed",
                        "readonly",
                        "disabled",
                    ],
                    h = t.concat(r, n, i, o, a, s, c, l, u, d, f, [
                        "@font-face",
                        "@keyframes",
                        "@media",
                        "@viewport",
                        "@page",
                        "@host",
                        "@supports",
                        "@block",
                        "@css",
                    ]);

                function p(e) {
                    return (
                        (e = e.sort(function(e, t) {
                            return t > e;
                        })),
                        new RegExp("^((" + e.join(")|(") + "))\\b")
                    );
                }

                function m(e) {
                    for (var t = {}, r = 0; r < e.length; ++r) t[e[r]] = !0;
                    return t;
                }
                e.registerHelper("hintWords", "stylus", h), e.defineMIME("text/x-styl", "stylus");
            })(r(2));
        },
        function(e, t, r) {
            (function(e) {
                "use strict";
                e.runMode = function(t, r, n, i) {
                    var o = e.getMode(e.defaults, r),
                        a =
                        /MSIE \d/.test(navigator.userAgent) &&
                        (null == document.documentMode || document.documentMode < 9);
                    if (n.appendChild) {
                        var l = (i && i.tabSize) || e.defaults.tabSize,
                            s = n,
                            c = 0;
                        (s.innerHTML = ""),
                        (n = function(e, t) {
                            if ("\n" == e)
                                return s.appendChild(document.createTextNode(a ? "\r" : e)), void(c = 0);
                            for (var r = "", n = 0;;) {
                                var i = e.indexOf("\t", n);
                                if (-1 == i) {
                                    (r += e.slice(n)), (c += e.length - n);
                                    break;
                                }
                                (c += i - n), (r += e.slice(n, i));
                                var o = l - (c % l);
                                c += o;
                                for (var u = 0; u < o; ++u) r += " ";
                                n = i + 1;
                            }
                            if (t) {
                                var d = s.appendChild(document.createElement("span"));
                                (d.className = "cm-" + t.replace(/ +/g, " cm-")),
                                d.appendChild(document.createTextNode(r));
                            } else s.appendChild(document.createTextNode(r));
                        });
                    }
                    for (
                        var u = e.splitLines(t), d = (i && i.state) || e.startState(o), f = 0, h = u.length; f < h;
                        ++f
                    ) {
                        f && n("\n");
                        var p = new e.StringStream(u[f]);
                        for (!p.string && o.blankLine && o.blankLine(d); !p.eol();) {
                            var m = o.token(p, d);
                            n(p.current(), m, f, p.start, d), (p.start = p.pos);
                        }
                    }
                };
            })(r(2));
        },
        function(e, t) {
            e.exports = { blink: "__codemirror_css__blink" };
        },
        function(e, t) {},
        function(e, t) {},
        function(e, t) {},
        function(e, t) {},
        function(e, t) {},
        function(e, t) {},
        function(e, t) {},
        function(e, t) {},
        function(e, t) {},
        function(e, t) {},
        function(e, t) {},
        function(e, t) {},
        function(e, t) {},
        function(e, t) {},
        function(e, t) {},
        function(e, t) {},
        function(e, t) {},
        function(e, t) {},
        function(e, t) {},
        function(e, t) {},
        function(e, t) {},
        function(e, t) {},
        function(e, t) {},
        function(e, t) {},
        function(e, t) {},
        function(e, t) {},
        function(e, t) {},
        function(e, t) {},
        function(e, t) {},
        function(e, t) {},
        function(e, t) {},
        function(e, t) {},
        function(e, t) {},
        function(e, t) {},
        function(e, t) {},
        function(e, t) {},
        function(e, t) {},
        function(e, t) {},
        function(e, t) {},
        function(e, t) {},
        function(e, t) {},
        function(e, t) {},
        function(e, t) {},
        function(e, t) {},
        function(e, t) {},
        function(e, t) {},
        function(e, t) {},
        function(e, t) {},
        function(e, t) {},
        function(e, t) {},
        function(e, t, r) {
            "use strict";
            Object.defineProperty(t, "__esModule", { value: !0 });
            var n = a(r(1)),
                i = r(6),
                o = a(i);

            function a(e) {
                return e && e.__esModule ? e : { default: e };
            }
            t.default = function(e, t, r) {
                return (
                    (r.className = (0, i.simpleHighligtherClasses)(n.default.colorscheme)),
                    o.default.runMode(e, t, r), { hl: r }
                );
            };
        },
        function(e, t, r) {
            "use strict";
            Object.defineProperty(t, "__esModule", { value: !0 });
            var n = o(r(6)),
                i = o(r(1));

            function o(e) {
                return e && e.__esModule ? e : { default: e };
            }
            t.default = function(e, t, r) {
                return {
                    cm: (0, n.default)(
                        function(e) {
                            r.parentNode.replaceChild(e, r);
                        }, {
                            value: e,
                            mode: t,
                            readOnly: !0,
                            lineNumbers: !0,
                            lineWrapping: !0,
                            theme: i.default.colorscheme,
                            showCursorWhenSelecting: !1,
                            cursorBlinkRate: -1,
                        }
                    ),
                };
            };
        },
        function(e, t) {},
        function(e, t, r) {
            "use strict";
            Object.defineProperty(t, "__esModule", { value: !0 });
            var n = (function() {
                    return function(e, t) {
                        if (Array.isArray(e)) return e;
                        if (Symbol.iterator in Object(e))
                            return (function(e, t) {
                                var r = [],
                                    n = !0,
                                    i = !1,
                                    o = void 0;
                                try {
                                    for (
                                        var a, l = e[Symbol.iterator](); !(n = (a = l.next()).done) && (r.push(a.value), !t || r.length !== t); n = !0
                                    );
                                } catch (e) {
                                    (i = !0), (o = e);
                                } finally {
                                    try {
                                        !n && l.return && l.return();
                                    } finally {
                                        if (i) throw o;
                                    }
                                }
                                return r;
                            })(e, t);
                        throw new TypeError("Invalid attempt to destructure non-iterable instance");
                    };
                })(),
                i = r(3),
                o = r(5),
                a = {
                    default: "jsx",
                    css: "css",
                    scss: "text/x-scss",
                    less: "text/x-less",
                    bash: "shell",
                    shell: "shell",
                    javascript: "javascript",
                    js: "javascript",
                    jsx: "jsx",
                    typescript: "text/typescript",
                    ts: "text/typescript",
                    tsx: "text/typescript",
                    json: "application/ld+json",
                },
                l = i.pathname.match(/\.js\.html/),
                s = i.pathname.match(/\.ts\.html/),
                c = i.pathname.match(/\.jsx\.html/),
                u = i.pathname.match(/\.tsx\.html/),
                d = l || s || c || u,
                f = function(e) {
                    var t = e.innerText,
                        r = e.querySelector("code"),
                        i = "";
                    if (r) {
                        var f = r.className.split(" ").filter(function(e) {
                                return e.match("lang");
                            }),
                            h = n(f, 1)[0];
                        if ((h && (i = h), "importPathCode" === r.getAttribute("data-ice"))) return { ip: e };
                    }
                    var p = i.replace(/lang(uage)?-/, "") || "default";
                    return (
                        (l || c) && (p = "jsx"),
                        (s || u) && (p = "ts"),
                        d ? (0, o.fullMode)(t, a[p], e) : (0, o.simpleMode)(t, a[p], e)
                    );
                };
            t.default = function(e) {
                return e.map(f);
            };
        },
        function(e, t, r) {
            "use strict";
            Object.defineProperty(t, "__esModule", { value: !0 });
            var n,
                i = r(3),
                o = r(11),
                a = (n = o) && n.__esModule ? n : { default: n };
            t.default = function(e) {
                var t = i.hash.match(/errorLines=([\d,]+)/);
                if (t) {
                    var r = (0, a.default)(t[1]);
                    r.forEach(function(t, r) {
                            return e.addLineClass(t, "wrap", "CodeMirror-errorline-background");
                        }),
                        e.scrollIntoView(r[0]);
                }
            };
        },
        function(e, t, r) {
            "use strict";
            Object.defineProperty(t, "__esModule", { value: !0 });
            var n,
                i = r(3),
                o = r(11),
                a = (n = o) && n.__esModule ? n : { default: n };
            t.default = function(e) {
                var t = i.hash.match(/activeLines=([\d,]+)/);
                if (t) {
                    var r = (0, a.default)(t[1]);
                    r.forEach(function(t, r) {
                            return e.addLineClass(t, "wrap", "CodeMirror-activeline-background");
                        }),
                        e.scrollIntoView(r[0]);
                }
            };
        },
        function(e, t, r) {
            "use strict";
            Object.defineProperty(t, "__esModule", { value: !0 });
            var n = r(3);
            t.default = function(e) {
                var t = n.hash.match(/lineNumber([\d]+)/);
                if (t) {
                    var r = parseInt(t[1], 10);
                    e.addLineClass(r - 1, "wrap", "CodeMirror-activeline-background"), e.scrollIntoView(r);
                }
            };
        },
        function(e, t, r) {
            "use strict";
            var n = r(0);

            function i(e) {
                if (Array.isArray(e)) {
                    for (var t = 0, r = Array(e.length); t < e.length; t++) r[t] = e[t];
                    return r;
                }
                return Array.from(e);
            }
            r(99),
                (0, n._$$)("manualCard").forEach(function(e) {
                    []
                    .concat(
                            i(e.querySelectorAll("a")),
                            i(e.querySelectorAll("input")),
                            i(e.querySelectorAll("select")),
                            i(e.querySelectorAll("button")),
                            i(e.querySelectorAll("[tabindex]"))
                        )
                        .forEach(function(e) {
                            e.setAttribute("tabindex", "-1");
                        });
                });
        },
        function(e, t) {},
        function(e, t, r) {
            "use strict";
            r(101);
        },
        function(e, t) {},
        function(e, t, r) {
            "use strict";
            r(103);
        },
        function(e, t) {},
        function(e, t, r) {
            "use strict";
            s(r(1));
            var n = r(0),
                i = r(12),
                o = (s(r(13)), s(r(105))),
                a = s(r(106)),
                l = s(r(107));

            function s(e) {
                return e && e.__esModule ? e : { default: e };
            }
            r(108), r(109);
            n.searchInput.addEventListener("keyup", function(e) {
                    return (0, o.default)(e.target.value.trim().toLowerCase(), n.searchResult);
                }),
                n.searchInput.addEventListener("keydown", function(e) {
                    return (0, a.default)(e, n.searchResult);
                }),
                n.searchResult.addEventListener("mousemove", function(e) {
                    return (0, l.default)(e.target, n.searchResult);
                }),
                n.body.addEventListener("click", function(e) {
                    (0, i.closeResults)(n.searchResult);
                });
        },
        function(e, t, r) {
            "use strict";
            Object.defineProperty(t, "__esModule", { value: !0 });
            var n = (function() {
                    return function(e, t) {
                        if (Array.isArray(e)) return e;
                        if (Symbol.iterator in Object(e))
                            return (function(e, t) {
                                var r = [],
                                    n = !0,
                                    i = !1,
                                    o = void 0;
                                try {
                                    for (
                                        var a, l = e[Symbol.iterator](); !(n = (a = l.next()).done) && (r.push(a.value), !t || r.length !== t); n = !0
                                    );
                                } catch (e) {
                                    (i = !0), (o = e);
                                } finally {
                                    try {
                                        !n && l.return && l.return();
                                    } finally {
                                        if (i) throw o;
                                    }
                                }
                                return r;
                            })(e, t);
                        throw new TypeError("Invalid attempt to destructure non-iterable instance");
                    };
                })(),
                i = l(r(1)),
                o = r(12),
                a = l(r(13));

            function l(e) {
                return e && e.__esModule ? e : { default: e };
            }
            t.default = function(e, t) {
                if (e) {
                    if (e !== i.default.prevText) {
                        i.default.prevText = e;
                        var r = {
                            class: [],
                            method: [],
                            member: [],
                            function: [],
                            variable: [],
                            typedef: [],
                            external: [],
                            file: [],
                            test: [],
                            testFile: [],
                        };
                        a.default.forEach(function(t, i) {
                            var o = n(t, 4),
                                a = o[0],
                                l = o[1],
                                s = o[2],
                                c = o[3];
                            if (e.length > 1 && a.indexOf(e) > -1) {
                                var u = s
                                    .split(/<\/?span.*?>/g)
                                    .filter(function(e) {
                                        return Boolean(e.trim());
                                    })
                                    .join(" "),
                                    d = u.split(new RegExp(e, "i")),
                                    f = u.match(new RegExp(e.replace(/\$/g, "\\$"), "ig")),
                                    h = d
                                    .map(function(e, t) {
                                        return (
                                            e +
                                            (f[t] ?
                                                '<strong class="search-match">' + f[t] + "</strong>" :
                                                "")
                                        );
                                    })
                                    .join("");
                                r[c].push(
                                    '\n        <li class="search-result-item">\n          <a class="search-result-link" href="' +
                                    l +
                                    '">\n            ' +
                                    h +
                                    "\n          </a>\n        </li>\n      "
                                );
                            }
                        });
                        var l = Object.keys(r)
                            .map(function(e) {
                                var t = r[e].join("");
                                return t ?
                                    '\n      <li class="search-separator">\n        ' +
                                    e +
                                    "\n      </li>\n    " +
                                    t :
                                    "";
                            })
                            .join("");
                        l ? (0, o.openResults)(t, l) : (0, o.closeResults)(t);
                    }
                } else(0, o.closeResults)(t);
            };
        },
        function(e, t, r) {
            "use strict";
            Object.defineProperty(t, "__esModule", { value: !0 });
            var n,
                i = r(1),
                o = (n = i) && n.__esModule ? n : { default: n },
                a = r(3);
            t.default = function(e, t) {
                var r = e.keyCode;
                if (40 === r) {
                    var n = t.children[o.default.selectedIndex],
                        i = t.children[o.default.selectedIndex + 1];
                    i &&
                        i.classList.contains("search-separator") &&
                        ((i = t.children[o.default.selectedIndex + 2]), o.default.selectedIndex++),
                        i &&
                        (n && n.classList.remove("selected"),
                            o.default.selectedIndex++,
                            i.classList.add("selected"));
                } else if (38 === r) {
                    var l = t.children[o.default.selectedIndex],
                        s = t.children[o.default.selectedIndex - 1];
                    s &&
                        s.classList.contains("search-separator") &&
                        ((s = t.children[o.default.selectedIndex - 2]), o.default.selectedIndex--),
                        s &&
                        (l && l.classList.remove("selected"),
                            o.default.selectedIndex--,
                            s.classList.add("selected"));
                } else {
                    if (13 !== r) return;
                    var c = t.children[o.default.selectedIndex];
                    if (c) {
                        var u = c.querySelector("a");
                        u && (0, a.setHref)(u.href);
                    }
                }
                e.preventDefault();
            };
        },
        function(e, t, r) {
            "use strict";
            Object.defineProperty(t, "__esModule", { value: !0 });
            var n,
                i = r(1),
                o = (n = i) && n.__esModule ? n : { default: n };
            t.default = function(e, t) {
                e.children[o.default.selectedIndex];
                for (var r = t; r && "LI" !== r.nodeName;) r = r.parentElement;
                r &&
                    (o.default.selectedIndex = []
                        .concat(
                            (function(e) {
                                if (Array.isArray(e)) {
                                    for (var t = 0, r = Array(e.length); t < e.length; t++) r[t] = e[t];
                                    return r;
                                }
                                return Array.from(e);
                            })(e.children)
                        )
                        .indexOf(r));
            };
        },
        function(e, t) {},
        function(e, t) {},
        function(e, t, r) {
            "use strict";
            Object.defineProperty(t, "__esModule", { value: !0 }), (t.switchLight = void 0);
            var n,
                i = r(1),
                o = (n = i) && n.__esModule ? n : { default: n },
                a = r(0);
            r(111), r(112), r(113), r(114);
            var l = function(e, t, r) {
                    return e === t ? r : t;
                },
                s = function(e, t) {
                    a.documentElement.classList.replace(t, e),
                        a.documentElement.classList.replace("no-js", "js");
                },
                c = (t.switchLight = function(e) {
                    e.preventDefault();
                    var t = o.default.mode,
                        r = l(t, "light", "dark");
                    (o.default.mode = r), (0, i.setLocalStorage)("mode", r), s(r, t);
                });
            a.modeSwitch.addEventListener("click", c), s(o.default.mode, l(o.default.mode, "light", "dark"));
        },
        function(e, t) {},
        function(e, t) {},
        function(e, t) {},
        function(e, t) {},
        function(e, t, r) {
            "use strict";
            var n,
                i = r(1),
                o = (n = i) && n.__esModule ? n : { default: n },
                a = r(0),
                l = r(5),
                s = r(10);
            r(116),
                l.colorschemes.forEach(function(e) {
                    var t = (0, a.createElement)(
                        "a", {
                            class: "nav-link" + (e === o.default.colorscheme ? " active-link" : ""),
                            href: "#",
                        },
                        e
                    );
                    t.addEventListener("click", function(r) {
                        r.preventDefault(),
                            (0, i.setLocalStorage)("colorscheme", e),
                            c(e),
                            (0, a.$)(".active-link", a.colorschemeOptions).classList.remove("active-link"),
                            t.classList.add("active-link");
                    });
                    var r = (0, a.createElement)("li", { class: "nav-item" }, t);
                    a.colorschemeOptions.appendChild(r);
                });
            var c = function(e) {
                s.fullHighlighters.forEach(function(t) {
                        t.setOption("theme", e);
                    }),
                    s.simpleHighlighters.forEach(function(t) {
                        t.className = (0, l.simpleHighligtherClasses)(e);
                    });
            };
            c(o.default.colorscheme);
        },
        function(e, t) {},
        function(e, t, r) {
            "use strict";
            var n,
                i = r(1),
                o = (n = i) && n.__esModule ? n : { default: n },
                a = r(0),
                l = (function(e) {
                    if (e && e.__esModule) return e;
                    var t = {};
                    if (null != e)
                        for (var r in e) Object.prototype.hasOwnProperty.call(e, r) && (t[r] = e[r]);
                    return (t.default = e), t;
                })(r(4));
            r(118);
            Object.keys(l).map(function(e) {
                return l[e];
            });
            Object.keys(l)
                .map(function(e) {
                    return l[e];
                })
                .forEach(function(e) {
                    var t = (0, a.createElement)(
                        "a", { class: "nav-link" + (e.key === o.default.font ? " active-link" : ""), href: "#" },
                        e.name
                    );
                    t.addEventListener("click", function(r) {
                        r.preventDefault(),
                            (0, i.setLocalStorage)("font", e.key),
                            (o.default.font = e.key),
                            c(e),
                            (0, a.$)(".active-link", a.fontOptions).classList.remove("active-link"),
                            t.classList.add("active-link");
                    });
                    var r = (0, a.createElement)("li", { class: "nav-item" }, t);
                    a.fontOptions.appendChild(r);
                });
            var s = new RegExp("font-[a-z0-9_-]+", "ig"),
                c = function() {
                    var e,
                        t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {},
                        r = a.documentElement.className.replace(s, "").split(" ").filter(Boolean);
                    a.documentElement.className = []
                        .concat(
                            (function(e) {
                                if (Array.isArray(e)) {
                                    for (var t = 0, r = Array(e.length); t < e.length; t++) r[t] = e[t];
                                    return r;
                                }
                                return Array.from(e);
                            })(r), [((e = t.className), e ? "font-" + e : "")]
                        )
                        .join(" ");
                };
            c(l[o.default.font]);
        },
        function(e, t) {},
        function(e, t, r) {
            "use strict";
            var n = r(0);
            r(120),
                n.githubLink &&
                (n.githubLink.removeAttribute("style"),
                    (n.githubLink.innerHTML =
                        "\n  <span class='icon github-icon'>\n    <svg viewBox='0 0 24 24'>\n      <path d='M20.38,8.53C20.54,8.13 21.06,6.54 20.21,4.39C20.21,4.39 18.9,4 15.91,6C14.66,5.67 13.33,5.62 12,5.62C10.68,5.62 9.34,5.67 8.09,6C5.1,3.97 3.79,4.39 3.79,4.39C2.94,6.54 3.46,8.13 3.63,8.53C2.61,9.62 2,11 2,12.72C2,19.16 6.16,20.61 12,20.61C17.79,20.61 22,19.16 22,12.72C22,11 21.39,9.62 20.38,8.53M12,19.38C7.88,19.38 4.53,19.19 4.53,15.19C4.53,14.24 5,13.34 5.8,12.61C7.14,11.38 9.43,12.03 12,12.03C14.59,12.03 16.85,11.38 18.2,12.61C19,13.34 19.5,14.23 19.5,15.19C19.5,19.18 16.13,19.38 12,19.38M8.86,13.12C8.04,13.12 7.36,14.12 7.36,15.34C7.36,16.57 8.04,17.58 8.86,17.58C9.69,17.58 10.36,16.58 10.36,15.34C10.36,14.11 9.69,13.12 8.86,13.12M15.14,13.12C14.31,13.12 13.64,14.11 13.64,15.34C13.64,16.58 14.31,17.58 15.14,17.58C15.96,17.58 16.64,16.58 16.64,15.34C16.64,14.11 16,13.12 15.14,13.12Z' />\n    </svg>\n  </span>\n  "),
                    n.githubLink.classList.add("github-link"),
                    n.mainHeader.appendChild(
                        (0, n.createElement)("div", { class: "github-link-wrapper" }, n.githubLink)
                    ));
        },
        function(e, t) {},
        function(e, t, r) {
            "use strict";
            r(122);
        },
        function(e, t) {},
        function(e, t, r) {
            "use strict";
            r(124);
        },
        function(e, t) {},
        function(e, t, r) {
            "use strict";
            var n,
                i = r(3),
                o = r(126),
                a = (n = o) && n.__esModule ? n : { default: n };
            r(127),
                r(128),
                r(129),
                r(130),
                (0, a.default)({ newURL: i.href }),
                window.addEventListener("hashchange", a.default),
                window.addEventListener("load", a.default);
        },
        function(e, t, r) {
            "use strict";
            Object.defineProperty(t, "__esModule", { value: !0 });
            var n = (function() {
                    return function(e, t) {
                        if (Array.isArray(e)) return e;
                        if (Symbol.iterator in Object(e))
                            return (function(e, t) {
                                var r = [],
                                    n = !0,
                                    i = !1,
                                    o = void 0;
                                try {
                                    for (
                                        var a, l = e[Symbol.iterator](); !(n = (a = l.next()).done) && (r.push(a.value), !t || r.length !== t); n = !0
                                    );
                                } catch (e) {
                                    (i = !0), (o = e);
                                } finally {
                                    try {
                                        !n && l.return && l.return();
                                    } finally {
                                        if (i) throw o;
                                    }
                                }
                                return r;
                            })(e, t);
                        throw new TypeError("Invalid attempt to destructure non-iterable instance");
                    };
                })(),
                i = r(0),
                o = r(3);

            function a(e) {
                if (Array.isArray(e)) {
                    for (var t = 0, r = Array(e.length); t < e.length; t++) r[t] = e[t];
                    return r;
                }
                return Array.from(e);
            }
            var l = function(e, t, r) {
                    if ((e && e.classList.add("active-link"), t)) {
                        var n = (0, i.$)("a", t);
                        t.classList.remove("hidden"), n.classList.toggle("active-link", n === r);
                    }
                },
                s = function(e, t) {
                    e && e.classList.remove("active-link"),
                        t && (t.classList.add("hidden"), (0, i.$)("a", t).classList.remove("active-link"));
                },
                c = function(e, t) {
                    var r = void 0,
                        n = void 0;
                    (0, i._$$)("navItem").forEach(function(o) {
                        var a = (0, i._$)("dirPath", o),
                            c = (0, i._$)("fakeLink", o);
                        a && r && (n = !0),
                            n ?
                            s(a, c) :
                            (o === e &&
                                ((r = !0),
                                    a ||
                                    (function(e) {
                                        for (var t = void 0, r = e; r.previousElementSibling && !t;) {
                                            var n = r.previousElementSibling,
                                                o = (0, i._$)("dirPath", n),
                                                a = (0, i._$)("fakeLink", n);
                                            l(o, a), (r = n), (t = o);
                                        }
                                    })(e)),
                                r ? l(a, c, t) : s(a, c));
                    });
                };
            t.default = function(e) {
                var t = e.newURL,
                    r = void 0 === t ? o.href : t;
                if (r.match(/.*\/manual\//))
                    return (function(e) {
                        var t = e.replace(/.*\/manual\//, "manual/"),
                            r = t.split("#"),
                            o = n(r, 1)[0],
                            l = (0, i.$$)(".active-link", i.sidebarLeft),
                            s = (0, i.$$)(".opened-link", i.sidebarLeft),
                            c = (0, i.$$)("[href*='" + o + "']", i.sidebarLeft),
                            u = (0, i.$$)("[href='" + o + "']", i.sidebarLeft),
                            d = (0, i.$$)("[href='" + t + "']", i.sidebarLeft),
                            f = [].concat(a(u), a(d));
                        l.forEach(function(e) {
                                e.classList.remove("active-link");
                            }),
                            s.forEach(function(e) {
                                e.classList.remove("opened-link");
                            }),
                            f.forEach(function(e) {
                                e.classList.add("active-link");
                            }),
                            c.forEach(function(e) {
                                e.classList.add("opened-link");
                            });
                    })(r);
                var l = r.split(/[#~]/),
                    s = n(l, 2),
                    u = (s[0], s[1]),
                    d = r.match(/[#~]/) || [],
                    f = n(d, 1)[0];
                u &&
                    (0, i.$$)('[href*="' + f + u + '"]', i.sidebarLeft).forEach(function(e) {
                        if (e.href === r) {
                            var t = (0, i._closest)(e, "navItem");
                            c(t, e);
                        }
                    });
            };
        },
        function(e, t, r) {
            "use strict";
            var n = r(0);
            n.settingsSwitch.addEventListener("click", function(e) {
                    e.preventDefault(), n.sidebarRight.classList.toggle("closed");
                }),
                n.body.addEventListener("click", function(e) {
                    var t = e.path,
                        r = t.indexOf(n.settingsSwitch) >= 0,
                        i = t.indexOf(n.sidebarRight) >= 0;
                    r || i || n.sidebarRight.classList.add("closed");
                });
        },
        function(e, t) {},
        function(e, t) {},
        function(e, t) {},
        function(e, t, r) {
            "use strict";
            Object.defineProperty(t, "__esModule", { value: !0 }),
                (t.toggleSidebar = t.openSidebar = t.closeSidebar = void 0);
            var n,
                i = r(1),
                o = (n = i) && n.__esModule ? n : { default: n },
                a = r(0);
            r(132),
                a.menuSwitch.addEventListener("click", function(e) {
                    e.preventDefault(),
                        console.log(),
                        s(o.default.sidebarLeft),
                        (o.default.sidebarLeft = !o.default.sidebarLeft);
                });
            var l = (t.closeSidebar = function() {
                    a.sidebarLeft.classList.remove("initial"), (o.default.sidebarLeft = !1), s(!0);
                }),
                s =
                ((t.openSidebar = function() {
                        a.sidebarLeft.classList.remove("initial"), (o.default.sidebarLeft = !0), s(!1);
                    }),
                    (t.toggleSidebar = function(e) {
                        a.sidebarLeft.classList.toggle("closed", e);
                    }));
            s(!o.default.sidebarLeft),
                a.body.addEventListener("click", function(e) {
                    e.path.indexOf(a.menuSwitch) < 0 && l();
                });
        },
        function(e, t) {},
        function(e, t, r) {
            "use strict";
            var n = (function() {
                    return function(e, t) {
                        if (Array.isArray(e)) return e;
                        if (Symbol.iterator in Object(e))
                            return (function(e, t) {
                                var r = [],
                                    n = !0,
                                    i = !1,
                                    o = void 0;
                                try {
                                    for (
                                        var a, l = e[Symbol.iterator](); !(n = (a = l.next()).done) && (r.push(a.value), !t || r.length !== t); n = !0
                                    );
                                } catch (e) {
                                    (i = !0), (o = e);
                                } finally {
                                    try {
                                        !n && l.return && l.return();
                                    } finally {
                                        if (i) throw o;
                                    }
                                }
                                return r;
                            })(e, t);
                        throw new TypeError("Invalid attempt to destructure non-iterable instance");
                    };
                })(),
                i = r(3),
                o = r(0),
                a = function(e) {
                    if (e) {
                        var t =
                            (r = e).replace("#", "")[0].match(/\d/) || r.match(/$/) ?
                            (0, o.$)(
                                '[id="' +
                                (function(e) {
                                    return e.replace(/^#/, "");
                                })(e) +
                                '"]'
                            ) :
                            (0, o.$)(e);
                        t && t.classList.add("active-target");
                    }
                    var r;
                };
            a(i.hash),
                window.addEventListener("hashchange", function(e) {
                    (0, o.$$)(".active-target").forEach(function(e) {
                        e.classList.remove("active-target");
                    });
                    var t = e.newURL,
                        r = t.match(/[#~]/),
                        i = n(r, 1)[0],
                        l = t.split(/[#~]/),
                        s = n(l, 2)[1];
                    s && a("" + i + s);
                });
        },
        function(e, t, r) {
            "use strict";
            var n = r(3),
                i = r(0);
            "file:" === n.protocol &&
                (0, i.$$)('a[href="./"]').forEach(function(e) {
                    e.href = "./index.html";
                });
        },
    ]);
});