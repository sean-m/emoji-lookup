import { emojis }  from './emojis.js';


let miniSearch = new MiniSearch({
  fields: ['group', 'subGroup', 'name', 'codePoint'], // fields to index for full-text search
  storeFields: ['name', 'representation', 'codePoint', 'section', 'status'], // fields to return with search results
  searchOptions: {
    boost: { name: 2 },
    fuzzy: 0.2
  }
})

miniSearch.addAll(emojis);

const emojiPickerViewModel = {
  searchTerm: ko.observable(''),
  delayedTerm: ko.pureComputed( function() {
    return emojiPickerViewModel.searchTerm().trim();
  }).extend({ rateLimit: { timeout: 200, method: "notifyWhenChangesStop" } }),
  filteredEmojis: null,
  selectEmoji: function(emoji) {
    navigator.clipboard.writeText(emoji.character);
  }
};

emojiPickerViewModel.filteredEmojis = ko.computed(function() {
  const term = emojiPickerViewModel.delayedTerm();
  if (!term) {
    return emojis.slice(0, 10).map(e => ({
      character: e.representation,
      name: e.name
    }));
  }
  const results = miniSearch.search(term);
  const resultCount = results.length
  return results.slice(0, 50).map(result => ({
    character: result.representation,
    name: result.name
  }));
});

const viewModel = {
  emojiPicker: emojiPickerViewModel
};

ko.applyBindings(viewModel);