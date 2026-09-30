/*!
    * Start Bootstrap - Creative v6.0.1 (https://startbootstrap.com/themes/creative)
    * Copyright 2013-2020 Start Bootstrap
    * Licensed under MIT (https://github.com/BlackrockDigital/startbootstrap-creative/blob/master/LICENSE)
    */
    (function($) {
  "use strict"; // Start of use strict  

  // Make carousel captions underneath images if window width is small.
  var updateWidth = function() {
    if (window.innerWidth < 550) {
      $('.carousel').css("height", "60rem");
    } else if (window.innerWidth < 1000) {
      $('.carousel').css("height", "50rem");
    }
  }
  $(document).ready(updateWidth);
  // Dynamically update width when window size changes.
  $(window).resize(updateWidth);  

  // Smooth scrolling using jQuery easing
  $('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function() {
    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
      var hash = this.hash || '';
      var target = hash.indexOf('#testimonies') === 0 ? $('#testimonies') : $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      if (target.length) {
        $('html, body').animate({
          scrollTop: (target.offset().top - 72)
        }, 1000, "easeInOutExpo");
        return false;
      }
    }
  });

  // Closes responsive menu when a scroll trigger link is clicked
  $('.js-scroll-trigger').click(function() {
    $('.navbar-collapse').collapse('hide');
  });

  // Activate scrollspy to add active class to navbar items on scroll
  $('body').scrollspy({
    target: '#mainNav',
    offset: 75
  });

  // Collapse Navbar
  var navbarCollapse = function() {
    if ($("#mainNav").offset().top > 100) {
      $("#mainNav").addClass("navbar-scrolled");
      // Change logo hover color to blue.
      $("#navbar_logo").attr("onmouseover", "this.style='filter: invert(45%) sepia(58%) saturate(3450%) hue-rotate(214deg) brightness(91%) contrast(80%)';");
      $("#navbar_logo").attr("onmouseout", "this.src='assets/img/hraacf_black.png'; this.style='filter: 0';");
    } else {
      $("#mainNav").removeClass("navbar-scrolled");
      // Change logo hover color to white.
      $("#navbar_logo").attr("onmouseover", "this.src='assets/img/hraacf_white.png'; this.style='filter: 0';");
      $("#navbar_logo").attr("onmouseout", "this.src='assets/img/hraacf_black.png'; this.style='filter: 0';");
    }
  };
  // Collapse now if page is not at top
  navbarCollapse();
  // Collapse the navbar when page is scrolled
  $(window).scroll(navbarCollapse);

  // Catalog first. The Substack RSS body loads only after someone opens a row.
  var testimonies = [];
  var filteredTestimonies = null;

  var slugFromUrl = function(url) {
    var match = (url || '').match(/\/p\/([a-z0-9-]+)/i);
    return match ? match[1] : '';
  };

  var testimonySlug = function() {
    var hash = (location.hash || '').replace(/^#/, '');
    var parts = hash.split('/');
    if (parts[0] !== 'testimonies') {
      return '';
    }
    return parts[1] || '';
  };

  var renderTestimonyRow = function(item, index) {
    var slug = slugFromUrl(item.url);
    var num = String(index + 1);
    if (num.length < 2) {
      num = '0' + num;
    }
    return $('<a class="testimony-row"/>')
      .attr('href', '#testimonies/' + slug)
      .append($('<span class="testimony-row-num"/>').text(num))
      .append($('<span class="testimony-row-title"/>').text(item.title))
      .append($('<span class="testimony-row-meta"/>').text(item.author + ' · ' + item.date));
  };

  var visibleTestimonies = function() {
    if (filteredTestimonies === null) {
      return testimonies;
    }
    return filteredTestimonies;
  };

  var showTestimonyList = function() {
    var $list = $('#testimony-list').empty().show();
    $.each(visibleTestimonies(), function(index, item) {
      $list.append(renderTestimonyRow(item, index));
    });
    $('#testimony-detail').attr('hidden', true).empty();
    $('.testimony-form-wrap').show();
    $('#testimonies').removeClass('is-reading');
  };

  var loadTestimonyBody = function(item) {
    var $body = $('<div class="testimony-body"/>').text('Loading the post…');
    $.getJSON('/api/substack', { url: item.url })
      .done(function(data) {
        if (data && data.html && window.DOMPurify) {
          $body.html(window.DOMPurify.sanitize(data.html, { USE_PROFILES: { html: true } }));
        } else {
          $body.text('This post could not be loaded here.');
        }
      })
      .fail(function() {
        $body.empty().append(
          $('<p/>').text('This post could not be loaded here. Open it on Substack instead.')
        );
      });
    return $body;
  };

  var showTestimonyDetail = function(item) {
    var $detail = $('#testimony-detail').empty().removeAttr('hidden');
    $detail.append(
      $('<p class="testimony-back"/>').append(
        $('<a href="#testimonies"/>').text('Index')
      )
    );
    $detail.append($('<p class="testimony-meta"/>').text(item.author + ' · ' + item.date));
    $detail.append($('<h3 class="testimony-title"/>').text(item.title));
    if (item.subtitle) {
      $detail.append($('<p class="testimony-subtitle"/>').text(item.subtitle));
    }
    $detail.append(loadTestimonyBody(item));
    $detail.append(
      $('<p class="testimony-source"/>').append(
        $('<a target="_blank" rel="noopener noreferrer"/>')
          .attr('href', item.url)
          .text('Originally on Substack')
      )
    );
    $('#testimony-list').hide();
    $('.testimony-form-wrap').hide();
    $('#testimonies').addClass('is-reading');
    var section = $('#testimonies');
    if (section.length) {
      $('html, body').animate({ scrollTop: section.offset().top - 72 }, 400);
    }
  };

  var syncTestimonyView = function() {
    if (!testimonies.length) {
      return;
    }
    var slug = testimonySlug();
    if (!slug) {
      showTestimonyList();
      return;
    }
    var match = null;
    $.each(testimonies, function(_, item) {
      if (slugFromUrl(item.url) === slug) {
        match = item;
        return false;
      }
    });
    if (match) {
      showTestimonyDetail(match);
    } else {
      showTestimonyList();
    }
  };

  var testimoniesStarted = false;

  var loadTestimoniesFonts = function() {
    if (document.getElementById('testimonies-fonts')) {
      return;
    }
    var link = document.createElement('link');
    link.id = 'testimonies-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500;1,600&family=Newsreader:ital,opsz,wght@0,8..60,400;0,8..60,500;1,8..60,400&display=swap';
    document.head.appendChild(link);
  };

  var loadTestimoniesSearch = function() {
    if (document.querySelector('script[data-testimonies-search]')) {
      return;
    }
    var script = document.createElement('script');
    script.type = 'module';
    script.src = 'js/testimonies-search.js';
    script.setAttribute('data-testimonies-search', '1');
    document.body.appendChild(script);
  };

  var startTestimonies = function() {
    if (testimoniesStarted) {
      return;
    }
    testimoniesStarted = true;
    loadTestimoniesFonts();
    loadTestimoniesSearch();
    window.hraacfTestimonies = {
      ready: function() {
        return testimonies.length > 0;
      },
      all: function() {
        return testimonies.slice();
      },
      filterTo: function(urls) {
        if (urls === null) {
          filteredTestimonies = null;
        } else {
          filteredTestimonies = [];
          $.each(urls, function(_, url) {
            $.each(testimonies, function(__, item) {
              if (item.url === url) {
                filteredTestimonies.push(item);
                return false;
              }
            });
          });
        }
        if (!testimonySlug()) {
          showTestimonyList();
        }
      }
    };
    $('#testimony-list').on('click', 'a.testimony-row', function(event) {
      event.preventDefault();
      if (location.hash !== this.hash) {
        history.pushState(null, '', this.hash);
      }
      syncTestimonyView();
    });
    $('#testimony-form').on('submit', function(event) {
      var url = ($('#testimony-url').val() || '').trim();
      var $error = $('#testimony-form-error');
      var isSubstack = /^https:\/\/([a-z0-9-]+\.)?substack\.com\//i.test(url);
      if (!isSubstack) {
        event.preventDefault();
        $error.text('Please use a Substack URL (https://….substack.com/p/…).').prop('hidden', false);
        return;
      }
      $error.prop('hidden', true);
    });
    $.getJSON('js/testimonies.json').done(function(items) {
      testimonies = items || [];
      syncTestimonyView();
    });
  };

  var wantsTestimonies = function() {
    return (location.hash || '').indexOf('#testimonies') === 0;
  };

  if (wantsTestimonies()) {
    startTestimonies();
  }
  $('a[href^="#testimonies"]').on('click', startTestimonies);
  $(window).on('hashchange popstate', function() {
    if (wantsTestimonies()) {
      startTestimonies();
    }
    if (testimoniesStarted) {
      syncTestimonyView();
    }
  });
  var testimoniesSection = document.getElementById('testimonies');
  if (testimoniesSection && 'IntersectionObserver' in window) {
    var testimoniesObserver = new IntersectionObserver(function(entries) {
      if (entries.some(function(entry) { return entry.isIntersecting; })) {
        startTestimonies();
        testimoniesObserver.disconnect();
      }
    }, { rootMargin: '120px' });
    testimoniesObserver.observe(testimoniesSection);
  }

  // Magnific popup calls
  $('#portfolio').magnificPopup({
    delegate: 'a',
    type: 'image',
    tLoading: 'Loading image #%curr%...',
    mainClass: 'mfp-img-mobile',
    gallery: {
      enabled: true,
      navigateByImgClick: true,
      preload: [0, 1]
    },
    image: {
      tError: '<a href="%url%">The image #%curr%</a> could not be loaded.'
    }
  });

})(jQuery); // End of use strict
