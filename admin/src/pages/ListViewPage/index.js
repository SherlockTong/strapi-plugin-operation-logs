import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import pluginId from "../../pluginId";
import { DateTime } from "luxon";
import axios from "axios";
import {
  Box,
  Table,
  Flex,
  Typography,
  Tbody,
  Thead,
  Tr,
  Td,
  Th,
  Button,
  SingleSelect,
  SingleSelectOption,
  Pagination,
  PreviousLink,
  PageLink,
  NextLink,
} from "@strapi/design-system";

const ListViewPage = () => {
  const history = useHistory();
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(
      () => Number(localStorage.getItem("pageSize")) || 20
  );

  // 新增的筛选逻辑
  const [module, setModule] = useState(""); // 初始筛选值为 “”
  const moduleList = [
    "Content Type",
    "Content Manager",
    "Component",
    "Media Library",
    "User",
    "Roles and Permissions",
  ];

  const fieldList = [
    { key: "id", desc: "ID" },
    { key: "module", desc: "Module" },
    { key: "model", desc: "Model" },
    { key: "action", desc: "Action" },
    { key: "actionDesc", desc: "Action Description" },
    { key: "relationIds", desc: "Relation Ids" },
    { key: "operator", desc: "Operator" },
    { key: "date", desc: "Date" },
  ];

  // 加载数据
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const params = {
          page,
          pageSize,
        };
        const filters = {};
        // 如果筛选值不是 ""，则添加筛选参数
        if (module !== "") {
          filters.module = module;
        }
        params.filters = filters;
        const { data } = await axios.get(`/${pluginId}/operation-logs`, {
          params,
        });
        setLogs(data.results);
        setTotal(data.pagination.total);
      } catch (error) {
        console.error("Error fetching logs:", error);
      }
    };
    fetchLogs();
  }, [page, pageSize, module]);

  const totalPages = Math.ceil(total / pageSize);

  // 处理页码生成逻辑
  const generatePageNumbers = () => {
    const pages = [];
    const ellipsis = "...";
    if (totalPages <= 6)
      return Array.from({ length: totalPages }, (_, i) => i + 1);

    if (page <= 4) {
      pages.push(...[1, 2, 3, 4, 5], ellipsis, totalPages);
    } else if (totalPages - page <= 3) {
      pages.push(
          1,
          ellipsis,
          ...Array.from({ length: 5 }, (_, i) => totalPages - 4 + i)
      );
    } else {
      pages.push(1, ellipsis, page - 1, page, page + 1, ellipsis, totalPages);
    }
    return pages;
  };

  // 事件处理函数
  const handlePageChange = (newPage) => setPage(newPage);
  const handlePageSizeChange = (value) => {
    setPageSize(Number(value));
    setPage(1);
    localStorage.setItem("pageSize", value);
  };
  const handleDetailClick = (id) => history.push(`/plugins/${pluginId}/${id}`);

  // Module单选框筛选事件处理函数
  const handleModuleFilterChange = (value) => {
    setModule(value);
    setPage(1); // 切换筛选时重置为第一页
  };

  const resetFilters = () => {
    setModule(""); // 重置筛选条件
    setPage(1); // 重置到第一页
  };

  const handleRelationIds = (relationIds) => {
    if (relationIds === "-") {
      return relationIds;
    }
    const relationIdList = JSON.parse(relationIds);
    if (relationIdList.length <= 3) {
      return relationIdList;
    }
    return relationIdList.slice(0, 3) + ",...";
  };

  return (
      <Box padding={8}>
        {/* 标题部分 */}
        <Flex direction="column" alignItems="flex-start" marginBottom={8}>
          <Typography variant="alpha" fontWeight="bold">
            Operation Logs
          </Typography>
          <Typography variant="epsilon" textColor="neutral600">
            {total} entries found
          </Typography>
        </Flex>

        {/* 筛选部分 */}
        <Flex alignItems="center" gap={2} marginBottom={4}>
          <Typography variant="secondary">Module is</Typography>
          <Box width="200px">
            <SingleSelect
                value={module}
                onChange={handleModuleFilterChange}
                placeholder="filter by module"
                size="medium"
            >
              {moduleList.map((value) => (
                  <SingleSelectOption key={value} value={value}>
                    {value}
                  </SingleSelectOption>
              ))}
            </SingleSelect>
          </Box>
          <Box marginLeft="auto">
            <Button onClick={resetFilters} variant="secondary">
              Reset
            </Button>
          </Box>
        </Flex>

        {/* 数据表格 */}
        <Typography fontSize="14px" textColor="neutral800" as="div">
          <Box marginBottom={4}>
            <Table colCount={8} rowCount={logs.length} footer={<></>}>
              <Thead>
                <Tr>
                  {fieldList.map((field) => (
                      <Th key={field.key} action={""}>
                        <Typography
                            variant="omega"
                            textColor="neutral600"
                            fontWeight="bold"
                        >
                          {field.desc}
                        </Typography>
                      </Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {logs.map((log) => (
                    <Tr key={log.id}>
                      {fieldList.map((field) => (
                          <Td>
                            <Typography variant="omega">
                              {field.key === "date"
                                  ? DateTime.fromISO(log.date).toFormat(
                                      "yyyy-LL-dd HH:mm:ss"
                                  )
                                  : field.key === "relationIds"
                                      ? handleRelationIds(log[field.key])
                                      : log[field.key]}
                            </Typography>
                          </Td>
                      ))}
                      <Td>
                        <Button onClick={() => handleDetailClick(log.id)}>
                          Detail
                        </Button>
                      </Td>
                    </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Typography>

        {/* 分页部分 */}
        <Flex justifyContent="space-between" alignItems="center" mt={4}>
          {/* 条目数选择 */}
          <Flex gap={2}>
            <SingleSelect
                value={pageSize}
                onChange={handlePageSizeChange}
                size="medium"
            >
              {[10, 20, 50, 100].map((size) => (
                  <SingleSelectOption key={size} value={size}>
                    {size}
                  </SingleSelectOption>
              ))}
            </SingleSelect>
            <Typography variant="secondary" textColor="neutral600">
              Entries per page
            </Typography>
          </Flex>

          {/* 分页 */}
          <Pagination activePage={page} pageCount={totalPages}>
            <PreviousLink
                as="button"
                to="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (page > 1) handlePageChange(page - 1);
                }}
            >
              {"<"}
            </PreviousLink>

            {generatePageNumbers().map((number, index) =>
                number === "..." ? (
                    <Typography key={index} variant="epsilon">
                      {number}
                    </Typography>
                ) : (
                    <PageLink
                        key={index}
                        as="button"
                        number={number}
                        isActive={page === number}
                        onClick={() => handlePageChange(number)}
                    >
                      {number}
                    </PageLink>
                )
            )}

            <NextLink
                as="button"
                to="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (page < totalPages) handlePageChange(page + 1);
                }}
            >
              {">"}
            </NextLink>
          </Pagination>
        </Flex>
      </Box>
  );
};

export default ListViewPage;
