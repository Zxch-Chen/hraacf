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
      var target = $(this.hash);
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

  // Published testimonies. Only repo maintainers add entries to js/testimonies.json.
  // Bodies come from the public Substack RSS feed, not from a copy stored in the repo.
  var renderTestimony = function(item) {
    var $card = $('<article class="testimony-card"/>');
    $card.append($('<p class="testimony-meta"/>').text(item.author + ' · ' + item.date));
    $card.append($('<h3 class="testimony-title"/>').text(item.title));
    if (item.subtitle) {
      $card.append($('<p class="testimony-subtitle"/>').text(item.subtitle));
    }
    var $body = $('<div class="testimony-body"/>').text('Loading the post…');
    $card.append($body);
    $card.append(
      $('<p class="testimony-source"/>').append(
        $('<a target="_blank" rel="noopener noreferrer"/>')
          .attr('href', item.url)
          .text('Originally on Substack')
      )
    );
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
    return $card;
  };

  $.getJSON('js/testimonies.json').done(function(items) {
    if (!items || !items.length) {
      return;
    }
    var $list = $('#testimony-list');
    $list.empty();
    $.each(items, function(_, item) {
      $list.append(renderTestimony(item));
    });
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
