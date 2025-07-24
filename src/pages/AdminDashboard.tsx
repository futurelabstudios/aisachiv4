import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users,
  MessageSquare,
  Clock,
  TrendingUp,
  Download,
  Search,
  RefreshCw,
  Calendar as CalendarIcon,
  X,
} from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  getStatistics,
  getConversations,
  exportConversations as exportConversationsService,
  type Conversation,
  type AdminStatistics as Statistics,
  type ConversationFilters,
} from '@/services/admin';

export default function AdminDashboard() {
  const { user, userProfile, session } = useAuth();
  const { language, t } = useLanguage();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [textFilters, setTextFilters] = useState({
    user_email: '',
    search_query: '',
  });
  const [date, setDate] = useState<DateRange | undefined>(undefined);

  const [filters, setFilters] = useState<ConversationFilters>({
    sort_by: 'created_at',
    sort_order: 'desc',
    page: 1,
    page_size: 20,
    user_email: '',
    search_query: '',
    interaction_type: 'all',
  });

  const fetchStatistics = async () => {
    try {
      const data = await getStatistics();
      setStatistics(data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const fetchConversations = async () => {
    setConversationsLoading(true);
    try {
      const data = await getConversations(filters);
      setConversations(data.conversations);
      setTotalPages(data.total_pages);
      setTotalCount(data.total_count);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
    setConversationsLoading(false);
  };

  const exportConversations = async () => {
    try {
      const blob = await exportConversationsService({
        user_email: filters.user_email,
        date_from: filters.date_from,
        date_to: filters.date_to,
        search_query: filters.search_query,
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conversations_export_${
        new Date().toISOString().split('T')[0]
      }.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting conversations:', error);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        user_email: textFilters.user_email,
        search_query: textFilters.search_query,
        page: 1,
      }));
    }, 500);
    return () => clearTimeout(handler);
  }, [textFilters.user_email, textFilters.search_query]);

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      page: 1,
      date_from: date?.from ? format(date.from, 'yyyy-MM-dd') : undefined,
      date_to: date?.to ? format(date.to, 'yyyy-MM-dd') : undefined,
    }));
  }, [date]);

  useEffect(() => {
    if (userProfile?.is_admin) {
      setLoading(true);
      fetchStatistics();
      fetchConversations().finally(() => setLoading(false));
    } else if (userProfile) {
      setLoading(false);
    }
  }, [userProfile]);

  useEffect(() => {
    if (userProfile?.is_admin) {
      fetchConversations();
    }
  }, [filters, userProfile]);

  const handleSortChange = (key: 'sort_by' | 'sort_order', value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setTextFilters({ user_email: '', search_query: '' });
    setDate(undefined);
    setFilters({
      sort_by: 'created_at',
      sort_order: 'desc',
      page: 1,
      page_size: 20,
      user_email: '',
      search_query: '',
      interaction_type: 'all',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatResponseTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getInteractionBadge = (type: string) => {
    const badges: { [key: string]: JSX.Element } = {
      chat: <Badge variant="default">Chat</Badge>,
      document_analysis: <Badge variant="secondary">Document</Badge>,
      document_question: <Badge variant="outline">Follow-up</Badge>,
      image_generation: <Badge variant="destructive">Image</Badge>,
    };
    return badges[type] || <Badge variant="default">{type}</Badge>;
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (!userProfile && loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
          <span className="ml-2 text-lg">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user || !userProfile?.is_admin) {
    return <Navigate to="/chat" replace />;
  }

  return (
    <div className="p-6 space-y-6">
      <Dialog
        open={!!selectedConversation}
        onOpenChange={(isOpen) => !isOpen && setSelectedConversation(null)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Conversation Details</DialogTitle>
            <DialogDescription>
              Full conversation with{' '}
              <strong>{selectedConversation?.user_email}</strong> on{' '}
              {selectedConversation &&
                formatDate(selectedConversation.created_at)}
            </DialogDescription>
          </DialogHeader>
          {selectedConversation && (
            <div className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto pr-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">User Question</h3>
                <p className="bg-gray-100 p-3 rounded-md">
                  {selectedConversation.user_question}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Assistant Answer</h3>
                <p className="bg-blue-50 p-3 rounded-md">
                  {selectedConversation.assistant_answer}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-semibold">Interaction Type</p>
                  <span>
                    {getInteractionBadge(
                      selectedConversation.interaction_type || 'chat'
                    )}
                  </span>
                </div>
                <div>
                  <p className="font-semibold">Response Time</p>
                  <span>
                    {formatResponseTime(selectedConversation.response_time)}
                  </span>
                </div>
                <div>
                  <p className="font-semibold">Date</p>
                  <span>{formatDate(selectedConversation.created_at)}</span>
                </div>
                {selectedConversation.metadata && (
                  <div className="col-span-2">
                    <p className="font-semibold">Metadata</p>
                    <pre className="bg-gray-100 p-2 rounded-md text-xs overflow-auto">
                      {JSON.stringify(selectedConversation.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {language === 'hindi' ? 'एडमिन डैशबोर्ड' : 'Admin Dashboard'}
          </h1>
          <p className="text-gray-600">
            {language === 'hindi'
              ? 'सभी उपयोगकर्ता बातचीत और आंकड़े देखें'
              : 'Monitor all user conversations and statistics'}
          </p>
        </div>
        <Button
          onClick={() => {
            fetchStatistics();
            fetchConversations();
          }}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          {language === 'hindi' ? 'रीफ्रेश' : 'Refresh'}
        </Button>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {language === 'hindi' ? 'कुल उपयोगकर्ता' : 'Total Users'}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.total_users}</div>
              <p className="text-xs text-muted-foreground">
                {statistics.active_users}{' '}
                {language === 'hindi' ? 'सक्रिय' : 'active'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {language === 'hindi' ? 'कुल बातचीत' : 'Total Conversations'}
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statistics.total_conversations}
              </div>
              <p className="text-xs text-muted-foreground">
                {statistics.conversations_today}{' '}
                {language === 'hindi' ? 'आज' : 'today'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {language === 'hindi'
                  ? 'औसत प्रतिक्रिया समय'
                  : 'Avg Response Time'}
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatResponseTime(statistics.avg_response_time)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {language === 'hindi' ? 'इस सप्ताह' : 'This Week'}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statistics.conversations_this_week}
              </div>
              <p className="text-xs text-muted-foreground">
                {language === 'hindi' ? 'बातचीत' : 'conversations'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Conversations Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {language === 'hindi'
                  ? 'उपयोगकर्ता बातचीत'
                  : 'User Conversations'}
              </CardTitle>
              <CardDescription>
                {language === 'hindi'
                  ? `कुल ${totalCount} बातचीत मिली`
                  : `${totalCount} total interactions found`}
              </CardDescription>
            </div>
            <Button onClick={exportConversations} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              {language === 'hindi' ? 'एक्सपोर्ट' : 'Export CSV'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-500" />
              <Input
                placeholder={
                  language === 'hindi'
                    ? 'ईमेल से खोजें...'
                    : 'Filter by email...'
                }
                value={textFilters.user_email || ''}
                onChange={(e) =>
                  setTextFilters((prev) => ({
                    ...prev,
                    user_email: e.target.value,
                  }))
                }
                className="w-48"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-500" />
              <Input
                placeholder={
                  language === 'hindi'
                    ? 'बातचीत में खोजें...'
                    : 'Search conversations...'
                }
                value={textFilters.search_query || ''}
                onChange={(e) =>
                  setTextFilters((prev) => ({
                    ...prev,
                    search_query: e.target.value,
                  }))
                }
                className="w-48"
              />
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={'outline'}
                  className={cn(
                    'w-[260px] justify-start text-left font-normal',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, 'LLL dd, y')} -{' '}
                        {format(date.to, 'LLL dd, y')}
                      </>
                    ) : (
                      format(date.from, 'LLL dd, y')
                    )
                  ) : (
                    <span>
                      {language === 'hindi'
                        ? 'दिनांक सीमा चुनें'
                        : 'Pick a date range'}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            <Select
              value={filters.interaction_type || 'all'}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  interaction_type: value,
                  page: 1,
                }))
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Interactions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Interactions</SelectItem>
                <SelectItem value="chat">Chat Only</SelectItem>
                <SelectItem value="document_analysis">
                  Document Analysis
                </SelectItem>
                <SelectItem value="document_question">
                  Follow-up Questions
                </SelectItem>
                <SelectItem value="image_generation">
                  Image Generation
                </SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.sort_by}
              onValueChange={(value) => handleSortChange('sort_by', value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">
                  {language === 'hindi' ? 'दिनांक' : 'Date'}
                </SelectItem>
                <SelectItem value="response_time">
                  {language === 'hindi' ? 'प्रतिक्रिया समय' : 'Response Time'}
                </SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.sort_order}
              onValueChange={(value) => handleSortChange('sort_order', value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">
                  {language === 'hindi' ? 'नवीनतम' : 'Newest'}
                </SelectItem>
                <SelectItem value="asc">
                  {language === 'hindi' ? 'पुराना' : 'Oldest'}
                </SelectItem>
              </SelectContent>
            </Select>

            <Button variant="ghost" onClick={clearFilters}>
              <X className="w-4 h-4 mr-2" />
              {language === 'hindi' ? 'फ़िल्टर साफ़ करें' : 'Clear Filters'}
            </Button>
          </div>

          {/* Conversations Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    {language === 'hindi' ? 'प्रकार' : 'Type'}
                  </TableHead>
                  <TableHead>
                    {language === 'hindi' ? 'उपयोगकर्ता' : 'User'}
                  </TableHead>
                  <TableHead>
                    {language === 'hindi' ? 'प्रश्न' : 'Question'}
                  </TableHead>
                  <TableHead>
                    {language === 'hindi' ? 'उत्तर' : 'Answer'}
                  </TableHead>
                  <TableHead>
                    {language === 'hindi' ? 'प्रतिक्रिया समय' : 'Response Time'}
                  </TableHead>
                  <TableHead>
                    {language === 'hindi' ? 'दिनांक' : 'Date'}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {conversationsLoading ? (
                  Array.from({ length: 10 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className="h-5 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-48" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-48" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-24" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : conversations.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-gray-500"
                    >
                      {language === 'hindi'
                        ? 'कोई बातचीत नहीं मिली'
                        : 'No interactions found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  conversations.map((conversation) => (
                    <TableRow
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation)}
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      <TableCell>
                        {getInteractionBadge(
                          conversation.interaction_type || 'chat'
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {conversation.user_email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          {truncateText(conversation.user_question, 100)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          {truncateText(conversation.assistant_answer, 100)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {formatResponseTime(conversation.response_time)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {formatDate(conversation.created_at)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500">
                {language === 'hindi'
                  ? `पृष्ठ ${filters.page} का ${totalPages}, कुल ${totalCount} बातचीत`
                  : `Page ${filters.page} of ${totalPages}, ${totalCount} total interactions`}
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      page: (prev.page || 1) - 1,
                    }))
                  }
                  disabled={(filters.page || 1) === 1 || conversationsLoading}
                >
                  {language === 'hindi' ? 'पिछला' : 'Previous'}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      page: (prev.page || 1) + 1,
                    }))
                  }
                  disabled={
                    (filters.page || 1) === totalPages || conversationsLoading
                  }
                >
                  {language === 'hindi' ? 'अगला' : 'Next'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
