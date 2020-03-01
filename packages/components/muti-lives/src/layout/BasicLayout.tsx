import React, { Component } from 'react';
import styles from './BasicLayout.less'
class BasicLayout extends Component {
    render() {
        const { children } = this.props
        return (
            <div className={styles.main}>
                {children}
            </div>
        );
    }
}

export default BasicLayout;