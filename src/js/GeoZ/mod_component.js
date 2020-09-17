import { Component } from "../game/component";

export class ModComponent extends Component {
	static getId() {
		const className = this.prototype.constructor.name;
		let id = className;
		const i = className.lastIndexOf("Component");
		if(i !== -1) {
			id = id.slice(0, i);
		}
		return id;
	}
}