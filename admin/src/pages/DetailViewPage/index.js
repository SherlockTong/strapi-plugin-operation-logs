import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Grid,
  GridItem,
  TextInput,
  Tag,
  DateTimePicker,
  Typography,
  JSONInput,
  Link,
  SingleSelect,
  SingleSelectOption,
  Flex,
} from "@strapi/design-system";
import axios from "axios";
import { ArrowLeft } from "@strapi/icons"; // 引入箭头图标
import pluginId from "../../pluginId";

const DetailViewPage = () => {
  const { id } = useParams(); // 获取动态 ID 参数
  const [logDetails, setLogDetails] = useState({
    module: "",
    method: "",
    model: "",
    action: "",
    actionDesc: "",
    operator: "",
    relationIds: [],
    date: null,
    url: "",
    request: null,
    response: null,
  });

  const moduleList = [
    "Content Type",
    "Content Manager",
    "Component",
    "Media Library",
    "User",
    "Roles and Permissions",
  ];
  const methodList = ["POST", "PUT", "DELETE"];

  // 请求数据
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await axios.get(`/${pluginId}/operation-logs/${id}`);
        const data = response.data;
        setLogDetails({
          module: data.module,
          method: data.method,
          model: data.model,
          action: data.action,
          actionDesc: data.actionDesc,
          operator: data.operator,
          relationIds:
              data.relationIds === "-"
                  ? []
                  : JSON.parse(data.relationIds).map(String),
          date: new Date(data.date),
          url: data.url,
          request: JSON.stringify(data.request, null, 2),
          response: JSON.stringify(data.response, null, 2),
        });
      } catch (error) {
        console.error("Error fetching log details:", error);
      }
    };
    fetchDetails();
  }, [id]);

  return (
      <Box padding={8} paddingTop={4}>
        {/* 返回按钮 */}
        <Box marginBottom={4}>
          <Link
              startIcon={<ArrowLeft />}
              to="#"
              onClick={() => history.back()} // 返回上一页
          >
            Back
          </Link>
        </Box>
        <Box marginBottom={8}>
          <Typography variant="alpha" fontWeight="bold">
            Operation Log Detail
          </Typography>
        </Box>
        <Grid gap={6} background="neutral0" shadow="filterShadow" padding={6}>
          {/* 第一行 */}
          <GridItem col={6}>
            <SingleSelect label="Module" value={logDetails.module} disabled>
              {moduleList.map((module) => (
                  <SingleSelectOption value={module}>{module}</SingleSelectOption>
              ))}
            </SingleSelect>
          </GridItem>
          <GridItem col={6}>
            <SingleSelect label="Method" value={logDetails.method} disabled>
              {methodList.map((method) => (
                  <SingleSelectOption value={method}>{method}</SingleSelectOption>
              ))}
            </SingleSelect>
          </GridItem>

          {/* 第二行 */}
          <GridItem col={6}>
            <TextInput label="Model" value={logDetails.model} disabled />
          </GridItem>
          <GridItem col={6}>
            <TextInput label="Action" value={logDetails.action} disabled />
          </GridItem>

          {/* 第三行 */}
          <GridItem col={6}>
            <TextInput
                label="Action Description"
                value={logDetails.actionDesc}
                disabled
            />
          </GridItem>
          <GridItem col={6}>
            <TextInput label="URL" name="url" value={logDetails.url} disabled />
          </GridItem>

          {/* 第四行 */}
          <GridItem col={6}>
            <TextInput label="Operator" value={logDetails.operator} disabled />
          </GridItem>
          {/* 日期与时间 */}
          <GridItem col={6}>
            <DateTimePicker
                label="Date"
                onChange={() => {}}
                value={logDetails.date}
                disabled
            />
          </GridItem>

          {/* 第五行 */}
          <GridItem col={6}>
            {logDetails.relationIds.length > 0 ? (
                <Flex spacing={4} direction="column" alignItems="start" gap={1}>
                  {/* 字段标题 */}
                  <Typography variant="pi" fontWeight="bold">
                    Relation IDs
                  </Typography>

                  {/* 标签展示区域 */}
                  <Flex
                      wrap="wrap"
                      gap={2}
                      background="neutral150"
                      hasRadius
                      style={{
                        width: "100%", // 设置容器的宽度
                        "min-height": "40px",
                        overflow: "auto", // 内容超出时可以滚动
                        border: "1px solid #dcdce4",
                        padding: "3px 10px",
                      }}
                  >
                    {logDetails.relationIds.map((relationId, index) => (
                        <Tag
                            key={index}
                            width="7%"
                            justifyContent="center"
                            hasRadius
                            icon={null} // 提供一个占位 icon
                            onClick={() => {}}
                        >
                          {relationId}
                        </Tag>
                    ))}
                  </Flex>
                </Flex>
            ) : (
                <TextInput label="Relation IDs" value="-" disabled />
            )}
          </GridItem>
          <GridItem col={6}></GridItem>

          {/* 第六行 */}
          <GridItem col={6}>
            <JSONInput
                label="Request"
                minHeight="235px"
                value={logDetails.request}
                disabled
            />
          </GridItem>

          <GridItem col={6}>
            <JSONInput
                label="Response"
                minHeight="235px"
                value={logDetails.response}
                disabled
            />
          </GridItem>
        </Grid>
      </Box>
  );
};

export default DetailViewPage;
