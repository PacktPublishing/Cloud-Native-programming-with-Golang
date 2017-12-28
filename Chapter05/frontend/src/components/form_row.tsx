import * as React from "react";

export interface FormRowProps {
    label?: string;
}

export class FormRow extends React.Component<FormRowProps, {}> {
    render() {
        //const label = this.props.label ? <label className="col-sm-2 control-label">{this.props.label}</label> : undefined;
        //const cls   = "col-sm-10" + (this.props.label ? "" : " col-sm-offset-2");

        return <div className="form-group">
            <label className="col-sm-2 control-label">{this.props.label}</label>
            <div className="col-sm-10">
                {this.props.children}
            </div>
        </div>
    }
}