/* eslint-disable */
import {fsm, util} from 'message-fsm';
import launch_fsm from './launch.fsm.js';
import yaml from 'js-yaml';

async function postData(url = ``, data = {}) {
  // Default options are marked with *
    var response = await fetch(url, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, cors, *same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            // "Content-Type": "application/x-www-form-urlencoded",
        },
        redirect: "follow", // manual, *follow, error
        referrer: "no-referrer", // no-referrer, *client
        body: JSON.stringify(data), // body data type must match "Content-Type" header
    })
	  return await response.json();
}

class Controller {

  constructor(app) {
    window.controller = this;
    this.app = app;
    this.protocol = "https://"
    this.server = "nginx-find-it-fix-it.5a9f.insights-dev.openshiftapps.com"
    this.launch = this.launch.bind(this);
    this.cancel = this.cancel.bind(this);
    this.get_api_object = this.get_api_object.bind(this);
    this.get_api_list = this.get_api_list.bind(this);
    this.get_api_url = this.get_api_url.bind(this);
    this.poll_log = this.poll_log.bind(this);
    this.poll_status = this.poll_status.bind(this);
		this.plan_id = 1;
		this.inventory_id = 1;
		this.key_id = 1;
		this.worker_id = 1;
    this.trace_order_seq = util.natural_numbers(0);
    this.controller = new fsm.FSMController(this, 'launch_fsm', launch_fsm.Start, this);
    this.channel = new fsm.Channel(null, this.controller, this);
    this.launch_enabled = true;
    this.cancel_enabled = false;
    this.hosts = [];
    this.playbook = {name: "", contents: ""};
    this.doc = [];
    this.playbook_run_id = null;
    this.plays = [];
    this.log = [];
    this.tasks_by_host = {};
  }

  async init() {
    this.hosts = await this.get_api_list('host', 'inventory=' + this.inventory_id);
    this.playbook = await this.get_api_object('playbook', 'plan_id=' + this.plan_id);
    this.doc = yaml.safeLoad(this.playbook.contents);
    var i = 0;
    for (i = 0; i < this.doc.length; i++) {
      if (this.doc[i].name !== undefined) {
        this.plays.push(this.doc[i].name);
      }
    }
    this.app.setState({});
    for(i = 0; i < this.hosts.length; i++) {
      this.tasks_by_host[this.hosts[i].host_id] = [];
    }
    await this.launch();
  }

  send_trace_message(message) {
    console.log(message)
  }

	get_api_url(name) {
    return this.protocol + this.server + '/insights_integration/api/' + name + '/';
	}

  async get_api_object_by_pk (object_type, pk) {
    var response = await fetch(this.get_api_url(object_type) + pk);
    var data = await response.json();
    return data;
  }

  async get_api_object (object_type, querystring) {
    var response = await fetch(this.get_api_url(object_type) + '?' + querystring);
    var data = await response.json();
    if (data.length !== 1) {
      console.log(data);
      return null;
    }
    return data[0];
  }

  async get_api_list (object_type, querystring) {
    var response = await fetch(this.get_api_url(object_type) + '?' + querystring);
    var data = await response.json();
    console.log(data);
    return data;
  }

  async launch (e) {
    this.log = [];
    console.log('launch');
    console.log(e);
    var playbook = await this.get_api_object('playbook', 'plan=' + this.plan_id);
    console.log(playbook);
    var playbook_run = await postData(this.get_api_url('playbookrun'),
			{
			"inventory": this.inventory_id,
			"key": this.key_id,
			"playbook": playbook.playbook_id,
			"host_pattern": "all",
			"status": "created"
			});
	 	console.log(playbook_run);
    this.playbook_run_id = playbook_run.playbook_run_id;
	  var worker_queue_entry = await postData(this.get_api_url('workerqueue'),
      {
          "worker": this.worker_id,
          "playbook_run": playbook_run.playbook_run_id
      });
    console.log(worker_queue_entry);
    this.channel.send('Launch', {});
    this.app.setState({});
  }

  cancel (e) {
    console.log('cancel');
    console.log(e);
  }

  async poll_log () {
    if (this.playbook_run_id === null) {
      return
    }
    try {
      this.log = await this.get_api_list('playbookrunlog', 'playbook_run=' + this.playbook_run_id);
      this.log.sort(function (a, b) {return a.order - b.order});
      this.app.setState({});
    } catch(err) {
      console.log('api error in poll_log');
    };
  }

  async poll_status () {
    console.log('poll_status');
    if (this.playbook_run_id === null) {
      console.log('no playbook_run_id');
      return
    }
    try {
      var playbookrun = await this.get_api_object_by_pk('playbookrun', this.playbook_run_id)
      console.log(playbookrun);
      var new_tasks_by_host = {};
      for(var i = 0; i < this.hosts.length; i++) {
        new_tasks_by_host[this.hosts[i].host_id] = [];
      }
      var trprs = await this.get_api_list('taskresultplaybookrun', 'playbook_run=' + this.playbook_run_id);
      var task_results = await this.get_api_list('taskresult', 'taskresultplaybookrun__playbook_run=' + this.playbook_run_id)
      for (i = 0; i < task_results.length; i++) {
        var task = task_results[i];
        new_tasks_by_host[task.host].push(task);
        console.log(task);
      }
      for(i = 0; i < this.hosts.length; i++) {
        new_tasks_by_host[this.hosts[i].host_id].sort(function (a, b) {return a.task_result_id - b.task_result_id});
      }
      this.tasks_by_host = new_tasks_by_host;
      console.log(['playbookrun.status', playbookrun.status]);
      if (playbookrun.status === "started") {
        this.channel.send('Started', {});
      }
      if (playbookrun.status === "completed") {
        this.channel.send('Complete', {});
      }
      this.app.setState({});
    } catch(err) {
       console.log('api error in poll_status');
    }
    console.log('poll_status end');
  }
};
export default Controller;
