import React, {useEffect, useState, useReducer} from 'react';
import PropTypes, { func } from 'prop-types';
import { Select } from '@alifd/next';
import axios from 'axios';

function useAsync(searchText, options) {
  const {keyword, dataFilter, dataName, dataSource: externalDataSource, predicate, dataURL, defaultDataSource, paging, withCredentials, pageSize} = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState(() => {
    return externalDataSource || [];
  });
  useEffect(() => {
    async function queryDataSource(searchText) {
      const response = await axios({
        method: 'GET',
        url: dataURL,
        withCredentials,
        params: {
          [keyword]: searchText,
          ...(paging ? {pageSize} : {}),
          ...(predicate || {}),
        }
      });
      return response;
    }
    function handleSearchTextChange() {
      setLoading(true);
      queryDataSource(searchText)
        .then(response => {
          const result = response.data;
          if (!result.success) {
            return Promise.reject(result.message);
          }
          const data = result[dataName];
          if (dataFilter != null) {
            return dataFilter(data);
          }
          return data;
        })
        .then(remoteData => {
          setDataSource(() => {
            return remoteData.concat(defaultDataSource || []);
          });
          setError(null);
        })
        .catch(function(err) {
          console.debug("query data source throw error.", err);
          setError(err.toString());
        })
        .finally(() => {
          setLoading(false);
        });
    }

    const timeout = setTimeout(() => {
      handleSearchTextChange();
    }, 200);
    return () => clearTimeout(timeout);
  }, [searchText, dataURL, predicate, keyword, dataFilter, paging, withCredentials, pageSize]);


  return {
    dataSource,
    loading,
    error,
  }
}

export default function AsyncSelect(props) {
  const {
    type,
    ...others
  } = props;
  
  const [searchText, setSearchText] = useState(null);
  const {dataSource, loading, error} = useAsync(searchText, props);

  return (
    <Select
      className="async-select"
      filterLocal={false}
      showSearch={true}
      onSearch={(searchText) => {
        setSearchText(searchText);
      }}
      state={loading ? 'loading' : error ? 'error' : ''}
      {...others}
      dataSource={dataSource}
    />
  );
}

function identity(value) {
  return value;
}

function noop() {}

AsyncSelect.propTypes = {
  queryFilter: PropTypes.func,
  dataFilter: PropTypes.func,

  onRequestData: PropTypes.func,
  onReceiveData: PropTypes.func,

  requestData: PropTypes.func,
  predicate: PropTypes.object,
  
  dataSource: PropTypes.array,
  defaultDataSource: PropTypes.array,

  paging: PropTypes.bool,
  pageSize: PropTypes.number,

  dataURL: PropTypes.string.isRequired,
  dataName: PropTypes.string,

  withCredentials: PropTypes.bool,
  noResultText: PropTypes.string,
  keyword: PropTypes.string,
  triggerName: PropTypes.string,
  isAsyncSearch: PropTypes.bool,
};

AsyncSelect.defaultProps = {
  // 异步请求参数过滤
  queryFilter: identity,
  // 请求返回结果过滤
  dataFilter: identity,
  onRequestData: noop,
  // 请求成功回调
  onReceiveData: noop,

  // 外置异步请求函数钩子
  requestData: undefined,
  // 外部查询条件
  predicate: {},

  // 数据源，异步请求成功之后，会被异步数据代替
  dataSource: undefined,
  // 默认的数据源，最终会和dataSource合并
  defaultDataSource: undefined,
  // 是否分页
  paging: false,
  // 分页大小
  pageSize: 50,
  // Json返回的数据字段
  dataName: 'data',
  // 是否跨域
  withCredentials: true,
  // 异步查询的关键字
  keyword: 'keyword',
  // 组件keyword改变后触发的回调方法名称
  triggerName: 'onInputUpdate',
  // 是否根据关键字变化异步搜索
  isAsyncSearch: false,
};
