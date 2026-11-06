# Generates every chapter page of the playbook from one shared shell.
# Run from anywhere:  ruby -Eutf-8 tools/build/build.rb
# Edit copy in content.rb, chapter visuals in scripts.js, and Step 1's body in step-1-body.html.
ROOT = File.expand_path("../..", __dir__)
DIR = File.dirname(__FILE__)
BAR = File.read(File.join(DIR, "bar.html")).sub('href="#top"', 'href="#top"')
S1_BODY = File.read(File.join(DIR, "step-1-body.html"))
SCRIPTS = File.read(File.join(DIR, "scripts.js")).split(/^\/\/ ==== (\S+) ====\n/).drop(1).each_slice(2).to_h

ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'

PAGES = [
  { slug: "intro", num: nil, toc: "The Dashboard Isn’t the Problem" },
  { slug: "step-1-listen", num: "01", toc: "Listen before you design" },
  { slug: "step-2-decide", num: "02", toc: "Know who decides what" },
  { slug: "step-3-source", num: "03", toc: "Follow the data to its source" },
  { slug: "step-4-align", num: "04", toc: "Agree on what matters" },
  { slug: "step-5-decisions", num: "05", toc: "Design around decisions" },
  { slug: "step-6-test", num: "06", toc: "Test before you build" },
  { slug: "where-to-start", num: "07", toc: "Where to start" },
]

def esc(s); s; end

def rail(cur, subnav)
  items = PAGES.each_with_index.map do |p, i|
    current = i == cur
    href = current ? "#top" : "../#{p[:slug]}/"
    aria = current ? ' aria-current="page"' : ""
    inner = if p[:num].nil?
      %(<a class="toc-link toc-intro" href="#{href}"#{aria}><span class="toc-kicker">Introduction</span><span>#{p[:toc]}</span></a>)
    else
      %(<a class="toc-link" href="#{href}"#{aria}><span class="toc-num">#{p[:num]}</span><span>#{p[:toc]}</span></a>)
    end
    if current
      subs = subnav.map { |id, label| %(            <li><a href="##{id}" data-spy="#{id}">#{label}</a></li>) }.join("\n")
      %(        <li class="toc-item is-current">\n          #{inner}\n          <ol class="subnav">\n#{subs}\n          </ol>\n        </li>)
    else
      %(        <li class="toc-item">#{inner}</li>)
    end
  end.join("\n")
  <<~HTML
    <aside class="rail" id="rail" aria-label="Playbook contents">
      <nav>
        <ol class="toc">
    #{items}
        </ol>
      </nav>
      <div class="assess">
        <h2>How data-ready is your organization?</h2>
        <button class="btn" type="button" data-soon="The assessment launches soon">Take the assessment
          #{ARROW}
        </button>
      </div>
    </aside>
  HTML
end

def hero(eyebrow, words, lead, key)
  w = words.split(" ").map { |x| %(<span class="w"><span>#{x}</span></span>) }.join(" ")
  <<~HTML
    <section class="sec" id="top" data-section="top" aria-labelledby="t-hero">
      <div class="panel hero">
        <div class="hero-art" aria-hidden="true"><svg viewBox="0 0 600 600" data-hero="#{key}"></svg></div>
        <div class="hero-inner">
          <p class="eyebrow">#{eyebrow}</p>
          <h1 class="display" id="t-hero">#{w}</h1>
          <p class="lead">#{lead}</p>
        </div>
        <div class="cue" aria-hidden="true"><i></i>Scroll</div>
      </div>
    </section>
  HTML
end

def people(id, title, lead, text, extra = "")
  <<~HTML
    <section class="sec" id="#{id}" data-section="#{id}" aria-labelledby="t-#{id}">
      <div class="panel people">
        <div class="people-head"><h2 class="h2" id="t-#{id}">#{title}</h2></div>
        <div class="people-body">
          <p class="people-lead" data-words>#{lead}</p>
          #{text.map { |t| %(<p class="people-text">#{t}</p>) }.join("\n      ")}
        </div>
        #{extra}
      </div>
    </section>
  HTML
end

def howto(cards)
  items = cards.map do |label, title, body|
    %(        <li class="card card--text">
          <div class="card-meta"><span class="card-label">#{label}</span></div>
          <div class="card-in"><div class="card-copy">
            <h3 class="card-title">#{title}</h3>
            <p class="card-body">#{body}</p>
          </div></div>
        </li>)
  end.join("\n")
  <<~HTML
    <section class="sec" id="how-to-apply" data-section="how-to-apply" aria-labelledby="t-howto">
      <div class="panel howto">
        <div class="howto-head">
          <div class="howto-head-l"><h2 class="h2" id="t-howto">How to apply it</h2></div>
          <div class="meter">
            <span class="meter-count"><b id="meter-cur">01</b> / <span id="meter-total">#{format("%02d", cards.size)}</span></span>
            <div class="ticks" role="group" aria-label="Jump to step"></div>
          </div>
        </div>
        <div class="howto-viewport">
          <ol class="howto-track">
    #{items}
          </ol>
        </div>
      </div>
    </section>
  HTML
end

def stats(list)
  return "" if list.empty?
  cls = { 1 => " one", 2 => " two" }[list.size] || ""
  rows = list.map { |n, label, pad| %(<div class="stat"><dt class="stat-label">#{label}</dt><dd class="stat-num" data-count="#{n}"#{pad == 0 ? ' data-pad="0"' : ""} style="margin:0;order:-1">#{pad == 0 ? n : format("%02d", n)}</dd></div>) }
  %(<dl class="stats#{cls}">\n            #{rows.join("\n            ")}\n          </dl>)
end

def quote(text)
  %(<figure class="field-quote">\n          <span class="qmark" aria-hidden="true">“</span>\n          <blockquote><p>#{text}</p></blockquote>\n          <figcaption>From the interviews</figcaption>\n        </figure>)
end

def aside(groups)
  inner = groups.map do |title, items|
    lis = items.map { |i| %(<li><span class="dot" aria-hidden="true"></span><span>#{i}</span></li>) }.join
    %(<div class="aside-group"><h3>#{title}</h3><ul class="aside-list">#{lis}</ul></div>)
  end.join("\n          ")
  %(<div class="field-aside">\n          #{inner}\n        </div>)
end

def field(paras, st, right)
  <<~HTML
    <section class="sec" id="in-the-field" data-section="in-the-field" aria-labelledby="t-field">
      <div class="panel field-panel">
        <div class="field-main">
          <div class="field-copy">
            <h2 class="h2" id="t-field">In the field</h2>
            #{paras.map { |p| "<p>#{p}</p>" }.join("\n        ")}
          </div>
          #{stats(st)}
        </div>
        #{right}
      </div>
    </section>
  HTML
end

def pull(text)
  %(<figure class="pull">\n          <span class="qmark" aria-hidden="true">“</span>\n          <blockquote><p>#{text}</p></blockquote>\n          <figcaption>From the interviews</figcaption>\n        </figure>)
end

def block(id, title, paras, right, body)
  top_cls = right ? "block-top" : "block-top is-solo"
  <<~HTML
    <section class="sec" id="#{id}" data-section="#{id}" aria-labelledby="t-#{id}">
      <div class="panel block">
        <div class="#{top_cls}" data-reveal>
          <div class="block-intro">
            <h2 class="h2" id="t-#{id}">#{title}</h2>
            #{paras.map { |p| "<p>#{p}</p>" }.join("\n        ")}
          </div>
          #{right}
        </div>
    #{body}
      </div>
    </section>
  HTML
end

def next_band(label, title, href)
  <<~HTML
    <div class="next">
      <a href="#{href}">
        <div class="next-copy">
          <p class="eyebrow">#{label}</p>
          <p class="next-title">#{title}</p>
        </div>
        <span class="next-arrow" aria-hidden="true">#{ARROW}</span>
      </a>
    </div>
  HTML
end

def page(i, title, subnav, body, script_key: nil)
  p = PAGES[i]
  chapter_js = script_key && SCRIPTS[script_key] ? "<script>\n#{SCRIPTS[script_key]}</script>\n" : ""
  howto_js = i == 1 ? %(<script src="../assets/motion/howto-scenes.js"></script>\n) : ""
  html = <<~HTML
    <!doctype html>
    <html lang="en">
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <title>#{title}</title>
    <link rel="icon" href="../assets/favicon.svg" type="image/svg+xml">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;500&family=Inter:ital,wght@0,300;0,400;0,500;1,300&display=swap">
    <link rel="stylesheet" href="../assets/playbook.css">

    <a class="skip" href="#main">Skip to content</a>

    #{BAR}
    <div class="shell">
    #{rail(i, subnav)}
      <div class="scrim" id="scrim"></div>

      <main id="main">
    #{body}
      </main>
    </div>

    <div class="toast" id="toast" role="status" aria-live="polite"></div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js"></script>
    <script src="../assets/motion/hero-scenes.js"></script>
    #{howto_js}#{chapter_js}<script src="../assets/playbook.js"></script>
    </html>
  HTML
  Dir.mkdir(File.join(ROOT, p[:slug])) unless Dir.exist?(File.join(ROOT, p[:slug]))
  File.write(File.join(ROOT, p[:slug], "index.html"), html)
  puts "wrote #{p[:slug]}"
end

load File.join(DIR, "content.rb")
