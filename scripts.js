let randomizingInterval;
let isRandomizing = false;
let toggleButton = $('#toggleRandomizing');
let messageWrap = $('.message');
const enterKeys = ['Enter', 'NumpadEnter'];

(function($) {

	let existingEntriesRaw = localStorage.getItem('entries');
	if (existingEntriesRaw?.length > 0) {
		let existingEntries = existingEntriesRaw.split(',');
		for (var existingEntry of existingEntries) {
			insertNewEntry(existingEntry);
		}
	} else {
		insertNewEntry();
	}

	$('.entries .entry').first().trigger('focus');

	$('body').on('click', '#toggleRandomizing', function() {
		if (isRandomizing) {
			stop();
		} else {
			start();
		}
	});

	$('body').on('click', '#addEntry', function() {
		insertNewEntry();
	});

	$('body').on('click', '#clearEntries', function() {
		$('.entries').empty();
		saveEntries([]);
		insertNewEntry();
	});

	$('body').on('click', '#copyOrder', function() {
		let entriesCopyList = '';
		let i = 1;
		$('.entry').each(function() {
			entriesCopyList += i + '. ' + $(this).text() + "\n";
			i++;
		});

		jQuery('body').append('<textarea class="entries-list-copy">' + entriesCopyList + '</textarea>').promise().done(function() {
			navigator.clipboard.writeText(jQuery('.entries-list-copy').text()).then(function() {
				jQuery('.entries-list-copy').remove();
			});
		});
	});

	jQuery('body').on('keypress', '.entries .entry[contenteditable]', function(e) {
		if (!enterKeys.includes(e.key)) { return true; }
		if ($(this).is(':last-child')) {
			insertNewEntry();
		}
		$(this).next().trigger('focus');
		document.execCommand('selectAll', false, null);
		return false;
	});

	$.fn.randomize = function(childElem) {
  return this.each(function() {
		var $this = $(this);
		var elems = $this.children(childElem);
		elems.sort(function() { return (Math.round(Math.random()) - 0.5); });
		$this.detach(childElem);
		for (var i = 0; i < elems.length; i++) {
			$this.append(elems[i]);
		}
  });
}

})(jQuery);

function start() {
	toggleButton.text('Stop');
	messageWrap.empty();
	if (cleanAndValidateEntries()) {
		randomizeEntriesSeries();
	} else {
		stop();
		if ($('.entries .entry').length == 0) {
			insertNewEntry();
		}
	}
}

function stop() {
	toggleButton.text('Start');
	clearInterval(randomizingInterval);
	isRandomizing = false;
	$('body').removeClass('is-randomizing');
}

function cleanAndValidateEntries() {
	let entriesRaw = $('.entries .entry');
	let entriesCleaned = [];
	entriesRaw.each(function() {
		let textContent = $(this).text().trim();
		if (textContent.length > 0) {
			$(this).text(textContent);
			entriesCleaned.push(textContent);
		} else {
			$(this).remove();
		}
	});
	if (entriesCleaned.length <= 1) {
		messageWrap.text('Must have more than 1 entry');
		return false;
	} else if (entriesCleaned.length != $.unique(entriesCleaned).length) {
		messageWrap.text('Duplicate entries');
		return false;
	}
	saveEntries(entriesCleaned);
	return true;
}

function randomizeEntriesSeries() {
	$('body').addClass('is-randomizing');
	isRandomizing = true;
	randomizingInterval = setInterval(function() {
		randomizeEntries();
	}, 25);
}

function randomizeEntries() {
	$('.entries').randomize('.entry');
}

function saveEntries(entries) {
	localStorage.setItem('entries', entries);
}

function insertNewEntry(content) {
	$('.entries').append('<div class="entry" contenteditable>' + (content && content.length > 0 ? content : '') + '</div>');
}
