import React, { Component } from 'react';
import { connect } from 'dva'


class Button extends Component<{ name: string }> {
    render() {
        const { name } = this.props
        return (
            <div>
                {name}
                <img src={require('../../assets/1.jpg')} alt=""/>
            </div>
        );
    }
}

export default connect(({ video } : any) => ({
    name: video.name
}))(Button);