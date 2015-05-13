// Generated by CoffeeScript 1.9.1
$(document).ready(function() {
  var calibri, close_others, georgia, today_pages;
  georgia = 'font-family: "Big Caslon", "Book Antiqua", "Palatino Linotype", Georgia, serif;';
  calibri = 'font-family: Calibri, Candara, Segoe, "Segoe UI", Optima, Arial, sans-serif;';
  window.blue = colourscheme.blues(0.6);
  window.notblue = colourscheme.browns(0.6);
  close_others = function() {
    var obj;
    obj = {
      active: false,
      pinned: false,
      currentWindow: true,
      url: "chrome://newtab/"
    };
    return chrome.tabs.query(obj, function(tabs) {
      return tabs.forEach(function(t) {
        return chrome.tabs.remove(t.id);
      });
    });
  };
  window.get_times = function() {
    var day, morning, night, now, workday;
    morning = new Date();
    if (morning.getHours() < 8) {
      morning.setDate(morning.getDate() - 1);
    }
    morning.setHours(7);
    morning.setMinutes(1);
    morning = morning.getTime();
    now = new Date().getTime();
    night = new Date();
    night.setHours(23);
    night.setMinutes(59);
    night = night.getTime();
    day = new Date().getDay();
    workday = !(day === 0 || day === 6);
    return {
      morning: morning,
      now: now,
      night: night,
      delta_now: now - morning,
      delta_day: night - morning,
      workday: workday
    };
  };
  today_pages = function(cb) {
    var times;
    if (cb == null) {
      cb = function() {};
    }
    times = get_times();
    return chrome.history.search({
      text: "",
      startTime: times.morning,
      endTime: times.now,
      maxResults: 2000
    }, function(tabs) {
      $("#pagecount").html(tabs.length + " pages");
      tabs = tabs.reverse();
      return cb(tabs);
    });
  };
  close_others();
  return today_pages(function(tabs) {
    return timeline(tabs, $("#timeline"));
  });
});

//# sourceMappingURL=index.js.map
