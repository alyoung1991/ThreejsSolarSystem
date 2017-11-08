window.addEventListener('keyup', function(event) { Key.onKeyup(event); }, false);
window.addEventListener('keydown', function(event) { Key.onKeydown(event); }, false);


var Key = {
  _pressed: {},

    ZERO: 48,
    ONE: 49,
    TWO: 50,
    THREE: 51,
    FOUR: 52,
    FIVE: 53,
    SIX: 54,
    SEVEN: 55,
    EIGHT: 56,
    NINE: 57,
	A: 65,
    B: 66,
    D: 68,
    E: 69,
    F: 70,
    G: 71,
    L: 76,
    R: 82,
    S: 83,
    T: 84,
    U: 85,
    W: 87,
	Q: 81,

    SPACE: 32,
	
	TAB: 9,
	ESCAPE: 27,

    LEFTARROW: 37,
    UPARROW: 38,
    RIGHTARROW: 39,
    DOWNARROW: 40,
  
  isDown: function(keyCode) {
    return this._pressed[keyCode];
  },
  
  onKeydown: function(event) {
    this._pressed[event.keyCode] = true;
  },
  
  onKeyup: function(event) {
    delete this._pressed[event.keyCode];
  }
};


/*
    window.addEventListener("keydown", function(evt) {
        alert("keydown: " + evt.keyCode);
    }, false);
*/