//-----------------------------------------------------------------------------

module("advanced");

//-----------------------------------------------------------------------------

test("multiple 'from' states for the same event", function() {

  var fsm = StateMachine.create({
    initial: 'green',
    events: [
      { name: 'warn',  from: 'green',             to: 'yellow' },
      { name: 'panic', from: ['green', 'yellow'], to: 'red'    },
      { name: 'calm',  from: 'red',               to: 'yellow' },
      { name: 'clear', from: ['yellow', 'red'],   to: 'green'  },
  ]});

  equals(fsm.current, 'green', "initial state should be green");

  ok(fsm.can('warn'),     "should be able to warn from green state")
  ok(fsm.can('panic'),    "should NOT be able to panic from green state")
  ok(fsm.cannot('calm'),  "should NOT be able to calm from green state")
  ok(fsm.cannot('clear'), "should NOT be able to clear from green state")

  fsm.warn();  equals(fsm.current, 'yellow', "warn  event should transition from green  to yellow");
  fsm.panic(); equals(fsm.current, 'red',    "panic event should transition from yellow to red");
  fsm.calm();  equals(fsm.current, 'yellow', "calm  event should transition from red    to yellow");
  fsm.clear(); equals(fsm.current, 'green',  "clear event should transition from yellow to green");

  fsm.panic(); equals(fsm.current, 'red',   "panic event should transition from green to red");
  fsm.clear(); equals(fsm.current, 'green', "clear event should transition from red to green");
   
});

//-----------------------------------------------------------------------------

test("multiple 'to' states for the same event", function() {

  var fsm = StateMachine.create({
    initial: 'hungry',
    events: [
      { name: 'eat',  from: 'hungry',                                to: 'satisfied' },
      { name: 'eat',  from: 'satisfied',                             to: 'full'      },
      { name: 'eat',  from: 'full',                                  to: 'sick'      },
      { name: 'rest', from: ['hungry', 'satisfied', 'full', 'sick'], to: 'hungry'    },
  ]});

  equals(fsm.current, 'hungry');

  ok(fsm.can('eat'));
  ok(fsm.can('rest'));

  fsm.eat();
  equals(fsm.current, 'satisfied');

  fsm.eat();
  equals(fsm.current, 'full');

  fsm.eat();
  equals(fsm.current, 'sick');

  fsm.rest();
  equals(fsm.current, 'hungry');

});

//-----------------------------------------------------------------------------

test("hooks are called when appropriate for multiple 'from' and 'to' transitions", function() {

  var fsm = StateMachine.create({
    initial: 'hungry',
    events: [
      { name: 'eat',  from: 'hungry',                                to: 'satisfied' },
      { name: 'eat',  from: 'satisfied',                             to: 'full'      },
      { name: 'eat',  from: 'full',                                  to: 'sick'      },
      { name: 'rest', from: ['hungry', 'satisfied', 'full', 'sick'], to: 'hungry'    },
  ]});

  var called = [];

  // state hooks
  fsm.onenterhungry    = function() { called.push('onenterhungry');    };
  fsm.onleavehungry    = function() { called.push('onleavehungry');    };
  fsm.onentersatisfied = function() { called.push('onentersatisfied'); };
  fsm.onleavesatisfied = function() { called.push('onleavesatisfied'); };
  fsm.onenterfull      = function() { called.push('onenterfull');      };
  fsm.onleavefull      = function() { called.push('onleavefull');      };
  fsm.onentersick      = function() { called.push('onentersick');      };
  fsm.onleavesick      = function() { called.push('onleavesick');      };

  // event hooks
  fsm.onbeforeeat    = function() { called.push('onbeforeeat');     };
  fsm.onaftereat     = function() { called.push('onaftereat');      };
  fsm.onbeforerest   = function() { called.push('onbeforerest');    };
  fsm.onafterrest    = function() { called.push('onafterrest');     };

  called = [];
  fsm.eat();
  deepEqual(called, ['onbeforeeat', 'onleavehungry', 'onentersatisfied', 'onaftereat']);

  called = [];
  fsm.eat();
  deepEqual(called, ['onbeforeeat', 'onleavesatisfied', 'onenterfull', 'onaftereat']);

  called = [];
  fsm.eat();
  deepEqual(called, ['onbeforeeat', 'onleavefull', 'onentersick', 'onaftereat']);

  called = [];
  fsm.rest();
  deepEqual(called, ['onbeforerest', 'onleavesick', 'onenterhungry', 'onafterrest']);

});

//-----------------------------------------------------------------------------



