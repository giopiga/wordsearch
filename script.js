// Grid content. ///////////////////////////////////////////////////////////////

const grid_width = 16;
const grid_height = 15;

const grid = 'MMILANOBSILveZnt' +
    'AABIHSUILLENIRAM' +
    'RETTOPYRRAHTEiAd' +
    'IuNIPOTIIeADETRR' +
    'ONBgiLNugMONEEEB' +
    'KHAISISSAOIMZLnA' +
    'ACNTBTodGDALOuMB' +
    'RAGMAEeBUTASOmEY' +
    'TEAilCYaIVOvePNS' +
    'IBAMENICARESSETI' +
    'HAntNIABARBEROAT' +
    'CViHqCuVaBOUQUET' +
    'OOOttOLSIRVAIHCE' +
    'IJAIDATASCIENCER' +
    'GSFPrAPPAEKLIRo';

const words_1 = [
  'AIDA',        'ALVAROSOLER', 'APPA',      'ASSISI',      'BABYSITTER',
  'BAMBINI',     'BANG',        'BARBERO',   'BOUQUET',     'CATAN',
  'CHIAVRIS',    'DATASCIENCE', 'GIOCHI',    'HARRYPOTTER', 'JOHNNYBGOODE',
  'JOVABEACH',   'LISBONA',     'MARINELLI', 'MARIOKART',   'MATEMATICA',
  'MATIZ',       'MENTA',       'MILANO',    'NIPOTI',      'POLIMIRUN',
  'POLITECNICO', 'RILKE',       'SFP',       'SHIBA',       'TESSERACINEMA',
  'UDINE',       'VALZER'
];

// const words_1 = ['AIDA'];

const answer = 'ventiduegiugnoduemilaventiquattro';

// State. //////////////////////////////////////////////////////////////////////

// Toggle "dragging" mode. Dragging mode is initiated by clicking (tapping?) on
// a letter and is terminated by releasing the click (on that or some other
// letter).
let dragging = false;

let dragging_start = [-1, -1];
let dragging_end = [-1, -1];
let dragging_direction = [0, 0];
let dragging_length = 0;

let found_grid_letters = Array(grid_height);
for (let i = 0; i < found_grid_letters.length; ++i) {
  found_grid_letters[i] = Array(grid_width);
  found_grid_letters[i].fill(false);
}

let found_words = Array(words_1.length);
found_words.fill(false);

let n_found = 0;

let answer_positions = [];

// Initialization. /////////////////////////////////////////////////////////////

let setup = function() {
  // Retrieve data from local storage, if any.
  if (localStorage.found_grid_letters) {
    found_grid_letters = JSON.parse(localStorage.found_grid_letters);
    found_words = JSON.parse(localStorage.found_words);
    n_found = parseInt(localStorage.n_found);
  }

  // Initialize the UI.
  let grid_wrapper = document.getElementById('grid-wrapper');
  let word_list_1 = document.getElementById('word-list');

  let template_letter = document.getElementById('template-letter');
  let template_word = document.getElementById('template-word');

  // Generate the grid of letters.
  template_letter.remove();
  for (let i = 0; i < grid_height; ++i) {
    for (let j = 0; j < grid_width; ++j) {
      const idx = j + grid_width * i;

      let letter_span = template_letter.cloneNode();

      letter_span.id = 'letter-' + i + '-' + j;
      letter_span.row = i;
      letter_span.col = j;

      $(letter_span).css({top: 32 * i, left: 32 * j, position: 'fixed'});

      if (idx < grid.length) {
        letter_span.textContent = grid.charAt(idx);
      } else {
        let last_letter_symbol = document.createElement('i');
        last_letter_symbol.className = 'fa-solid fa-infinity';
        letter_span.appendChild(last_letter_symbol);
      }

      if (found_grid_letters[i][j]) letter_span.className += ' found';

      grid_wrapper.appendChild(letter_span);
    }

    const br = document.createElement('br');
    grid_wrapper.appendChild(br);
  }

  // Generate the list of words.
  template_word.remove();
  for (let i = 0; i < words_1.length; ++i) {
    const word = words_1[i];

    let word_span = template_word.cloneNode();

    word_span.id = 'word-' + i;
    word_span.textContent = word;

    if (found_words[i]) word_span.className += ' found';

    word_list_1.appendChild(word_span);
  }

  // Generate the answer.
  let answer_wrapper = document.getElementById('answer');
  for (let i = 0; i < answer.length; ++i) {
    let letter_span = template_letter.cloneNode();

    letter_span.id = 'answer-' + i;
    letter_span.textContent = answer.charAt(i);

    let child = answer_wrapper.appendChild(letter_span);

    let pos = child.getBoundingClientRect();
    answer_positions.push({top: pos.top, left: pos.left});

    if (i == 7 || i == 13 || i == 20)
      answer_wrapper.appendChild(document.createElement('br'));
  }

  let handler_down = function(e) {
    if (n_found >= words_1.length) return;

    let el = document.elementFromPoint(e.pageX, e.pageY);
    if (!el || el.id.substring(0, 6) != 'letter') return;

    dragging = true;
    dragging_start = [el.row, el.col];
  };

  let handler_move = function(e) {
    if (!dragging) return;

    let el = document.elementFromPoint(e.pageX, e.pageY);
    if (!el || el.id.substring(0, 6) != 'letter') return;

    dragging_end = [el.row, el.col];

    const diff = [
      dragging_end[0] - dragging_start[0], dragging_end[1] - dragging_start[1]
    ];

    const theta = Math.atan2(diff[1], diff[0]);
    const pi = Math.PI;

    if (-pi / 8 < theta && theta <= pi / 8) {
      dragging_direction = [1, 0];
      dragging_length = dragging_end[0] - dragging_start[0];
    } else if (pi / 8 < theta && theta <= 3 * pi / 8) {
      dragging_direction = [1, 1];
      dragging_length = dragging_end[0] - dragging_start[0];
    } else if (3 * pi / 8 < theta && theta <= 5 * pi / 8) {
      dragging_direction = [0, 1];
      dragging_length = dragging_end[1] - dragging_start[1];
    } else if (5 * pi / 8 < theta && theta <= 7 * pi / 8) {
      dragging_direction = [-1, 1];
      dragging_length = dragging_end[1] - dragging_start[1];
    } else if (7 * pi / 8 < theta || theta < -7 * pi / 8) {
      dragging_direction = [-1, 0];
      dragging_length = dragging_start[0] - dragging_end[0];
    } else if (-7 * pi / 8 <= theta && theta < -5 * pi / 8) {
      dragging_direction = [-1, -1];
      dragging_length = dragging_start[0] - dragging_end[0];
    } else if (-5 * pi / 8 <= theta && theta < -3 * pi / 8) {
      dragging_direction = [0, -1];
      dragging_length = dragging_start[1] - dragging_end[1];
    } else if (-3 * pi / 8 <= theta && theta < -1 * pi / 8) {
      dragging_direction = [1, -1];
      dragging_length = dragging_start[1] - dragging_end[1];
    }

    dragging_length += 1;

    $('.dragged').removeClass('dragged');

    let cur = dragging_start.slice(0);
    for (let i = 0; i < dragging_length; ++i) {
      $('#letter-' + cur[0] + '-' + cur[1]).addClass('dragged');

      cur[0] += dragging_direction[0];
      cur[1] += dragging_direction[1];
    }
  };

  let handler_up = function(e) {
    if (!dragging) return;

    $('.dragged').removeClass('dragged');
    dragging = false;

    // Retrieve the dragged word.
    let word = '';
    {
      let cur = dragging_start.slice(0);
      for (let i = 0; i < dragging_length; ++i) {
        const idx = cur[1] + grid_width * cur[0];
        word += grid[idx];

        cur[0] += dragging_direction[0];
        cur[1] += dragging_direction[1];
      }
    }

    // Check if it belongs to the list of words.
    let found_word_idx = undefined;

    for (let i = 0; i < words_1.length; ++i) {
      if (word == words_1[i]) {
        found_words[i] = true;
        found_word_idx = i;
        ++n_found;

        break;
      }
    }

    // If the word is correct, we update the corresponding word list
    // element as well as the letters in the grid.
    if (found_word_idx != undefined) {
      $('#word-' + found_word_idx).addClass('found');

      let cur = dragging_start.slice(0);
      for (let i = 0; i < dragging_length; ++i) {
        $('#letter-' + cur[0] + '-' + cur[1]).addClass('found');

        found_grid_letters[cur[0]][cur[1]] = true;

        cur[0] += dragging_direction[0];
        cur[1] += dragging_direction[1];
      }

      // We also update the local storage.
      localStorage.found_words = JSON.stringify(found_words);
      localStorage.n_found = n_found;
      localStorage.found_grid_letters = JSON.stringify(found_grid_letters);
    }

    if (n_found == words_1.length) {
      win();
    }
  };

  window.addEventListener('pointerdown', handler_down);
  window.addEventListener('pointermove', handler_move);
  window.addEventListener('pointerup', handler_up);

  $('#playagain').on('click', function() {
    reset();
    location.reload();
  });

  if (n_found == words_1.length) win();
};

let win =
    function() {
  $('.found').addClass('faded');

  setTimeout(function() {
    $('#grid-wrapper .letter:not(.found)').each(function(i) {
      if (i < answer_positions.length)
        $(this).css($('#answer-' + i).position());
    });

    $('.found').fadeOut();
    $('#playagain').fadeIn();
  }, 1500);
}

let reset = function() {
  $('.found').removeClass('found');

  found_grid_letters = Array(grid_height);
  for (let i = 0; i < found_grid_letters.length; ++i) {
    found_grid_letters[i] = Array(grid_width);
    found_grid_letters[i].fill(false);
  }

  found_words = Array(words_1.length);
  found_words.fill(false);

  n_found = 0;

  // We also update the local storage.
  localStorage.found_words = JSON.stringify(found_words);
  localStorage.n_found = n_found;
  localStorage.found_grid_letters = JSON.stringify(found_grid_letters);
}