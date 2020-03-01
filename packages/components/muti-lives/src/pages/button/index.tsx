import React, { Component } from 'react';
import { connect } from 'dva'


class Button extends Component<{ name: string }> {
    render() {
        const { name } = this.props
        return (
            <div>
                {name}
            </div>
        );
    }
}

export default connect(({ video } : any) => ({
    name: video.name
}))(Button);