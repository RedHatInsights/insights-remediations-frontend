/* eslint-disable */
var inherits = require('inherits');
var fsm = require('message-fsm').fsm;

function _State () {
}
inherits(_State, fsm._State);


function _Ready () {
    this.name = 'Ready';
}
inherits(_Ready, _State);
var Ready = new _Ready();
exports.Ready = Ready;

function _Running () {
    this.name = 'Running';
}
inherits(_Running, _State);
var Running = new _Running();
exports.Running = Running;

function _Starting () {
    this.name = 'Starting';
}
inherits(_Starting, _State);
var Starting = new _Starting();
exports.Starting = Starting;

function _Completed () {
    this.name = 'Completed';
}
inherits(_Completed, _State);
var Completed = new _Completed();
exports.Completed = Completed;

function _Start () {
    this.name = 'Start';
}
inherits(_Start, _State);
var Start = new _Start();
exports.Start = Start;



_Ready.prototype.start = function (controller) {

  controller.scope.launch_enabled = true;
  controller.scope.cancel_enabled = false;

};

_Ready.prototype.onLaunch = function (controller) {

    controller.changeState(Starting);

};
_Ready.prototype.onLaunch.transitions = ['Starting'];


_Running.prototype.start = function (controller) {

  //Add api poller to watch for events
};

_Running.prototype.end = function (controller) {

  //Stop api poller
};

_Running.prototype.onComplete = function (controller) {

    controller.changeState(Completed);
    console.log('Completed');
    clearInterval(controller.scope.status_poller);
    clearInterval(controller.scope.log_poller);
};
_Running.prototype.onComplete.transitions = ['Completed'];

_Starting.prototype.start = function (controller) {

  controller.scope.launch_enabled = false;
  controller.scope.cancel_enabled = true;
  controller.scope.status_poller = setInterval(controller.scope.poll_status, 1000);
  controller.scope.log_poller = setInterval(controller.scope.poll_log, 1000);
};


_Starting.prototype.onStarted = function (controller) {

    controller.changeState(Running);

};
_Starting.prototype.onStarted.transitions = ['Running'];



_Completed.prototype.start = function (controller) {

    controller.changeState(Ready);
    controller.scope.app.setState({alertSuccessVisible: true});
    clearInterval(controller.scope.status_poller);
    clearInterval(controller.scope.log_poller);
};
_Completed.prototype.start.transitions = ['Ready'];



_Start.prototype.start = function (controller) {

    controller.changeState(Ready);

};
_Start.prototype.start.transitions = ['Ready'];

