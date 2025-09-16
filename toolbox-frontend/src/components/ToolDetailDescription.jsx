import React from 'react';
import {
  Typography,
  Card,
  CardContent,
  Grid,
  Divider,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  Container,
  Stack
} from '@mui/material';
import {
  LightbulbOutlined,
  BuildOutlined,
  HelpOutlineOutlined,
  CheckCircleOutlined
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { getToolDetails } from '../utils/toolDetails.js';

export default function ToolDetailDescription({ toolPath, children }) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const details = getToolDetails(toolPath, t);

  if (!details) {
    return children || null;
  }

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 2, md: 4 }, py: 4 }}>
      <Grid container spacing={4}>
        {/* 左侧信息栏 */}
        <Grid item xs={12} lg={3}>
          <Box sx={{ position: 'sticky', top: 24 }}>
            <Stack spacing={3}>
              {/* 核心功能卡片 */}
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CheckCircleOutlined sx={{ color: 'secondary.main', mr: 1 }} />
                    <Typography variant="h6" sx={{ m: 0, color: 'text.primary' }}>
                      {t('toolDescription.featuresTitle')}
                    </Typography>
                  </Box>
                  <List dense>
                    {details.features.map((feature, index) => (
                      <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 20 }}>
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              backgroundColor: 'secondary.main'
                            }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={feature}
                          primaryTypographyProps={{
                            fontSize: '14px',
                            color: 'text.secondary'
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>

              {/* 使用技巧卡片 */}
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LightbulbOutlined sx={{ color: '#fa8c16', mr: 1 }} />
                    <Typography variant="h6" sx={{ m: 0, color: 'text.primary' }}>
                      {t('toolDescription.tipsTitle')}
                    </Typography>
                  </Box>
                  <List dense>
                    {details.tips.map((tip, index) => (
                      <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 20 }}>
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              backgroundColor: '#fa8c16'
                            }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={tip}
                          primaryTypographyProps={{
                            fontSize: '14px',
                            color: 'text.secondary'
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Stack>
          </Box>
        </Grid>

        {/* 中间操作区域 */}
        <Grid item xs={12} lg={6}>
          <Box sx={{ minHeight: '600px' }}>
            {children}
          </Box>
        </Grid>

        {/* 右侧信息栏 */}
        <Grid item xs={12} lg={3}>
          <Box sx={{ position: 'sticky', top: 24 }}>
            <Stack spacing={3}>
              {/* 使用场景卡片 */}
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <BuildOutlined sx={{ color: '#722ed1', mr: 1 }} />
                    <Typography variant="h6" sx={{ m: 0, color: 'text.primary' }}>
                      {t('toolDescription.useCasesTitle')}
                    </Typography>
                  </Box>
                  <List dense>
                    {details.useCases.map((useCase, index) => (
                      <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 20 }}>
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              backgroundColor: '#722ed1'
                            }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={useCase}
                          primaryTypographyProps={{
                            fontSize: '14px',
                            color: 'text.secondary'
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>

              {/* 常见问题卡片 */}
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <HelpOutlineOutlined sx={{ color: '#eb2f96', mr: 1 }} />
                    <Typography variant="h6" sx={{ m: 0, color: 'text.primary' }}>
                      {t('toolDescription.faqTitle')}
                    </Typography>
                  </Box>
                  <Box>
                    {details.faq.map((faq, index) => (
                      <Box key={index} sx={{ mb: 2 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'text.primary',
                            fontWeight: 600,
                            display: 'block',
                            mb: 0.5
                          }}
                        >
                          Q: {faq.q}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'text.secondary',
                            fontSize: '14px',
                            pl: 1
                          }}
                        >
                          A: {faq.a}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}